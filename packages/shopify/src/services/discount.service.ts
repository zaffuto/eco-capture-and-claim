import { Session, shopifyApi, ApiVersion } from '@shopify/shopify-api';
import { getSessionToken } from '@shopify/app-bridge-utils';
import type { ClientApplication } from '@shopify/app-bridge';
import { config } from '../config';
import { z } from 'zod';
import { supabase } from '@eco/database';

// Validación de entrada
const createEcoCuponSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  value: z.number().min(0).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  maxUses: z.number().min(1),
  userId: z.string().uuid(),
});

interface DiscountNode {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  status: string;
  discountCode: {
    code: string;
  };
}

interface DiscountConnection {
  edges: Array<{
    node: DiscountNode;
  }>;
}

interface DiscountQueryResponse {
  data: {
    codeDiscountNodes: DiscountConnection;
  };
}

interface CreateDiscountInput {
  title: string;
  code: string;
  percentage: number;
  startsAt: string;
  endsAt?: string;
}

interface CreateDiscountResponse {
  data: {
    discountCodeBasicCreate: {
      codeDiscountNode: DiscountNode;
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  };
}

export class DiscountService {
  private shopify;
  private static instance: DiscountService;

  private constructor() {
    this.shopify = shopifyApi({
      apiKey: config.SHOPIFY_API_KEY,
      apiSecretKey: config.SHOPIFY_API_SECRET,
      scopes: ['write_discounts', 'read_discounts'],
      hostName: config.SHOPIFY_SHOP_NAME,
      apiVersion: ApiVersion.January23,
      isEmbeddedApp: true,
    });
  }

  public static getInstance(): DiscountService {
    if (!DiscountService.instance) {
      DiscountService.instance = new DiscountService();
    }
    return DiscountService.instance;
  }

  async createEcoCupon(input: z.infer<typeof createEcoCuponSchema>, session: Session) {
    try {
      const validatedInput = createEcoCuponSchema.parse(input);
      const client = new this.shopify.clients.Graphql({ session });

      const response = await client.query({
        data: {
          query: `
            mutation discountCodeBasicCreate($input: DiscountCodeBasicInput!) {
              discountCodeBasicCreate(codeDiscount: $input) {
                codeDiscountNode {
                  id
                  codeDiscount {
                    ... on DiscountCodeBasic {
                      title
                      codes(first: 1) {
                        nodes {
                          code
                        }
                      }
                      startsAt
                      endsAt
                      customerSelection {
                        ... on DiscountCustomerAll {
                          allCustomers
                        }
                      }
                      customerGets {
                        value {
                          ... on DiscountPercentage {
                            percentage
                          }
                        }
                        items {
                          ... on AllDiscountItems {
                            allItems
                          }
                        }
                      }
                      appliesOncePerCustomer
                    }
                  }
                  userErrors {
                    field
                    code
                    message
                  }
                }
              }
            }
          `,
          variables: {
            input: {
              title: validatedInput.name,
              code: validatedInput.code,
              startsAt: validatedInput.startDate,
              endsAt: validatedInput.endDate,
              customerSelection: {
                all: true,
              },
              customerGets: {
                value: {
                  percentage: validatedInput.value,
                },
                items: {
                  all: true,
                },
              },
              appliesOncePerCustomer: true,
            },
          },
        },
      });

      const discount = response as unknown as {
        body: {
          data: {
            discountCodeBasicCreate: {
              codeDiscountNode: {
                id: string;
                codeDiscount: {
                  title: string;
                  codes: {
                    nodes: Array<{
                      code: string;
                    }>;
                  };
                  startsAt: string;
                  endsAt: string | null;
                  customerSelection: {
                    allCustomers: boolean;
                  };
                  customerGets: {
                    value: {
                      percentage: number;
                    };
                    items: {
                      allItems: boolean;
                    };
                  };
                  appliesOncePerCustomer: boolean;
                };
              };
              userErrors: Array<{
                field: string[];
                code: string;
                message: string;
              }>;
            };
          };
        };
      };

      if (discount.body.data.discountCodeBasicCreate.userErrors.length > 0) {
        throw new Error(
          discount.body.data.discountCodeBasicCreate.userErrors[0].message,
        );
      }

      return discount.body.data.discountCodeBasicCreate.codeDiscountNode;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw error;
    }
  }

  async validateEcoCupon(code: string) {
    try {
      // Sanitizar entrada
      const sanitizedCode = code.trim().toUpperCase();
      if (!/^[A-Z0-9-_]+$/.test(sanitizedCode)) {
        return { valid: false, message: 'Código inválido' };
      }

      // Verificar en Supabase
      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .select('*')
        .eq('code', sanitizedCode)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      if (!cupon) return { valid: false, message: 'Cupón no encontrado' };

      // Verificar fecha de expiración
      if (cupon.expiry_date && new Date(cupon.expiry_date) < new Date()) {
        await this.deactivateEcoCupon(cupon.id);
        return { valid: false, message: 'Cupón expirado' };
      }

      // Verificar límite de uso
      if (cupon.usage_limit && cupon.times_used >= cupon.usage_limit) {
        await this.deactivateEcoCupon(cupon.id);
        return { valid: false, message: 'Cupón alcanzó el límite de uso' };
      }

      return { valid: true, cupon };

    } catch (error) {
      console.error('Error validating eco cupon:', error);
      throw error;
    }
  }

  private async deactivateEcoCupon(cuponId: string) {
    try {
      // Validar UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cuponId)) {
        throw new Error('Invalid cupon ID format');
      }

      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .update({ status: 'inactive' })
        .eq('id', cuponId)
        .select()
        .single();

      if (error) throw error;

      // Desactivar en Shopify
      if (cupon.shopify_price_rule_id) {
        const client = new this.shopify.clients.Rest({
          session: new Session({
            id: '',
            shop: config.SHOPIFY_SHOP_NAME,
            state: '',
            isOnline: true,
            accessToken: config.SHOPIFY_ACCESS_TOKEN,
          }),
        });

        await client.put({
          path: `price_rules/${cupon.shopify_price_rule_id}`,
          data: {
            price_rule: {
              status: 'disabled'
            }
          }
        });
      }

      return cupon;

    } catch (error) {
      console.error('Error deactivating eco cupon:', error);
      throw error;
    }
  }

  async incrementCuponUsage(code: string) {
    try {
      // Sanitizar entrada
      const sanitizedCode = code.trim().toUpperCase();
      if (!/^[A-Z0-9-_]+$/.test(sanitizedCode)) {
        throw new Error('Invalid coupon code format');
      }

      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .update({ times_used: { increment: 1 } })
        .eq('code', sanitizedCode)
        .select()
        .single();

      if (error) throw error;

      // Verificar si alcanzó el límite
      if (cupon.usage_limit && cupon.times_used >= cupon.usage_limit) {
        await this.deactivateEcoCupon(cupon.id);
      }

      return cupon;

    } catch (error) {
      console.error('Error incrementing cupon usage:', error);
      throw error;
    }
  }

  async getEcoCupons(userId: string) {
    try {
      const { data: cupons, error } = await supabase
        .from('ecocupons')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return cupons;
    } catch (error) {
      console.error('Error getting EcoCupons:', error);
      throw error;
    }
  }

  async getEcoCupon(code: string) {
    try {
      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        throw error;
      }

      return cupon;
    } catch (error) {
      console.error('Error getting EcoCupon:', error);
      throw error;
    }
  }

  async updateEcoCupon(code: string, updates: Partial<z.infer<typeof createEcoCuponSchema>>) {
    try {
      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .update(updates)
        .eq('code', code)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return cupon;
    } catch (error) {
      console.error('Error updating EcoCupon:', error);
      throw error;
    }
  }

  async deleteEcoCupon(code: string) {
    try {
      const { error } = await supabase
        .from('ecocupons')
        .delete()
        .eq('code', code);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting EcoCupon:', error);
      throw error;
    }
  }
}

export async function getDiscounts(app: ClientApplication): Promise<DiscountNode[]> {
  try {
    const sessionToken = await getSessionToken(app);
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': sessionToken,
        'X-Shopify-Api-Version': ApiVersion.January23,
      },
      body: JSON.stringify({
        query: `
          query GetDiscounts {
            codeDiscountNodes(first: 10) {
              edges {
                node {
                  id
                  title
                  startsAt
                  endsAt
                  status
                  discountCode {
                    code
                  }
                }
              }
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch discounts');
    }

    const data = (await response.json()) as DiscountQueryResponse;
    return data.data.codeDiscountNodes.edges.map((edge) => edge.node);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    throw error;
  }
}

export async function createDiscount(
  app: ClientApplication,
  input: CreateDiscountInput
): Promise<DiscountNode> {
  try {
    const sessionToken = await getSessionToken(app);
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': sessionToken,
        'X-Shopify-Api-Version': ApiVersion.January23,
      },
      body: JSON.stringify({
        query: `
          mutation CreateDiscount($input: DiscountCodeBasicInput!) {
            discountCodeBasicCreate(codeDiscount: $input) {
              codeDiscountNode {
                id
                title
                startsAt
                endsAt
                status
                discountCode {
                  code
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            title: input.title,
            code: input.code,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            percentage: input.percentage,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create discount');
    }

    const data = await response.json() as CreateDiscountResponse;
    
    if (data.data.discountCodeBasicCreate.userErrors.length > 0) {
      throw new Error(data.data.discountCodeBasicCreate.userErrors[0].message);
    }

    return data.data.discountCodeBasicCreate.codeDiscountNode;
  } catch (error) {
    console.error('Error creating discount:', error);
    throw error;
  }
}
