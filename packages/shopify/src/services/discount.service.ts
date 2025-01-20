import { shopifyApi, ApiVersion, Session } from '@shopify/shopify-api';
import { getSessionToken } from '@shopify/app-bridge-utils';
import type { ClientApplication } from '@shopify/app-bridge';
import { config } from '../config';

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
        code: string;
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

  // Temporarily disabled methods that depend on database
  async createEcoCupon() {
    throw new Error('Método temporalmente deshabilitado durante mantenimiento');
  }

  async validateEcoCupon() {
    throw new Error('Método temporalmente deshabilitado durante mantenimiento');
  }

  async deactivateEcoCupon() {
    throw new Error('Método temporalmente deshabilitado durante mantenimiento');
  }

  async incrementCuponUsage() {
    throw new Error('Método temporalmente deshabilitado durante mantenimiento');
  }

  async getEcoCupons() {
    throw new Error('Método temporalmente deshabilitado durante mantenimiento');
  }

  async getEcoCupon() {
    throw new Error('Método temporalmente deshabilitado durante mantenimiento');
  }

  async updateEcoCupon() {
    throw new Error('Método temporalmente deshabilitado durante mantenimiento');
  }

  async deleteEcoCupon() {
    throw new Error('Método temporalmente deshabilitado durante mantenimiento');
  }

  // Methods that don't depend on database remain unchanged
  async getDiscounts(app: ClientApplication): Promise<DiscountNode[]> {
    const token = await getSessionToken(app);
    const client = new this.shopify.clients.Graphql({
      session: new Session({
        id: '',
        shop: config.SHOPIFY_SHOP_NAME,
        state: '',
        isOnline: true,
        accessToken: token,
      }),
    });

    const query = `
      query getDiscounts {
        codeDiscountNodes(first: 100) {
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
    `;

    const response = await client.query<DiscountQueryResponse>({ data: query });
    return response.body.data.codeDiscountNodes.edges.map((edge) => edge.node);
  }

  async createDiscount(
    app: ClientApplication,
    input: CreateDiscountInput
  ): Promise<DiscountNode> {
    const token = await getSessionToken(app);
    const client = new this.shopify.clients.Graphql({
      session: new Session({
        id: '',
        shop: config.SHOPIFY_SHOP_NAME,
        state: '',
        isOnline: true,
        accessToken: token,
      }),
    });

    const mutation = `
      mutation createDiscount($input: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(input: $input) {
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
            code
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        title: input.title,
        code: input.code,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        customerSelection: {
          all: true,
        },
        customerGets: {
          value: {
            percentage: input.percentage,
          },
          items: {
            all: true,
          },
        },
      },
    };

    const response = await client.query<CreateDiscountResponse>({
      data: { query: mutation, variables },
    });

    if (response.body.data.discountCodeBasicCreate.userErrors.length > 0) {
      throw new Error(
        response.body.data.discountCodeBasicCreate.userErrors[0].message
      );
    }

    return response.body.data.discountCodeBasicCreate.codeDiscountNode;
  }
}
