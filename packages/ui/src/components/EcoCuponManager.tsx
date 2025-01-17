'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@eco/database';
import { DiscountService } from '@eco/shopify';
import {
  Card,
  Text,
  Button,
  Modal,
  TextField,
  Select,
  DatePicker,
  DataTable,
  Banner,
  Spinner,
  BlockStack,
  InlineStack,
  Box,
} from '@shopify/polaris';
import { useAuth } from '@eco/shared';

const discountService = DiscountService.getInstance();

interface DateRange {
  start: Date;
  end: Date;
}

export const EcoCuponManager: React.FC = () => {
  const { user, session } = useAuth();
  const [cupons, setCupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    startDate: new Date(),
    expiryDate: new Date(),
    usageLimit: '',
  });

  useEffect(() => {
    if (session) {
      console.log('Loading cupons with session:', session);
      loadCupons();
    } else {
      console.log('No session available');
      setError('Please sign in to manage cupons');
    }
  }, [session]);

  const loadCupons = async () => {
    try {
      setLoading(true);
      console.log('Fetching cupons...');
      const { data, error: fetchError } = await supabase
        .from('eco_cupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching cupons:', fetchError);
        throw fetchError;
      }

      console.log('Cupons loaded:', data);
      setCupons(data || []);
    } catch (err) {
      console.error('Error in loadCupons:', err);
      setError('Error al cargar cupones: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!session) {
      setError('Please sign in to create cupons');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Creating cupon with data:', formData);

      const { data, error: createError } = await supabase
        .from('eco_cupons')
        .insert([
          {
            ...formData,
            user_id: user?.id,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating cupon:', createError);
        throw createError;
      }

      console.log('Cupon created successfully:', data);
      setIsModalOpen(false);
      await loadCupons();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Error al crear el cupón: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!session) {
      setError('Please sign in to deactivate cupons');
      return;
    }

    try {
      setLoading(true);
      console.log('Deactivating cupon:', id);

      const { error: updateError } = await supabase
        .from('eco_cupons')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (updateError) {
        console.error('Error deactivating cupon:', updateError);
        throw updateError;
      }

      console.log('Cupon deactivated successfully');
      await loadCupons();
    } catch (err) {
      console.error('Error in handleDeactivate:', err);
      setError('Error al desactivar el cupón: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Card>
        <BlockStack>
          <Banner tone="warning">
            <p>Please sign in to manage cupons</p>
          </Banner>
        </BlockStack>
      </Card>
    );
  }

  const rows = cupons.map((cupon) => [
    cupon.code,
    cupon.discount_type === 'percentage' ? `${cupon.discount_value}%` : `$${cupon.discount_value}`,
    cupon.min_purchase_amount ? `$${cupon.min_purchase_amount}` : 'N/A',
    cupon.times_used || 0,
    cupon.status,
    <Button
      disabled={cupon.status !== 'active' || loading}
      onClick={() => handleDeactivate(cupon.id)}
    >
      Desactivar
    </Button>,
  ]);

  return (
    <div>
      {error && (
        <Banner tone="critical" onDismiss={() => setError('')}>
          <p>{error}</p>
        </Banner>
      )}

      <Card>
        <BlockStack>
          <InlineStack align="space-between">
            <Text as="h2" variant="headingLg">Eco Cupones</Text>
            <Button 
              variant="primary" 
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
            >
              Crear Cupón
            </Button>
          </InlineStack>

          {loading ? (
            <div className="flex justify-center p-4">
              <Spinner accessibilityLabel="Loading cupons" size="large" />
            </div>
          ) : (
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'numeric', 'text', 'text']}
              headings={['Código', 'Descuento', 'Mínimo de compra', 'Usos', 'Estado', 'Acciones']}
              rows={rows}
            />
          )}
        </BlockStack>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Eco Cupón"
        primaryAction={{
          content: 'Crear',
          onAction: handleSubmit,
          loading: loading,
        }}
        secondaryActions={[
          {
            content: 'Cancelar',
            onAction: () => setIsModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack>
            <TextField
              label="Código"
              value={formData.code}
              onChange={(value) => setFormData({ ...formData, code: value })}
              autoComplete="off"
              disabled={loading}
            />

            <Select
              label="Tipo de descuento"
              options={[
                { label: 'Porcentaje', value: 'percentage' },
                { label: 'Monto fijo', value: 'fixed_amount' },
              ]}
              value={formData.discountType}
              onChange={(value) => setFormData({ ...formData, discountType: value })}
              disabled={loading}
            />

            <TextField
              label="Valor del descuento"
              value={formData.discountValue}
              onChange={(value) => setFormData({ ...formData, discountValue: value })}
              type="number"
              autoComplete="off"
              disabled={loading}
            />

            <TextField
              label="Monto mínimo de compra"
              value={formData.minPurchaseAmount}
              onChange={(value) => setFormData({ ...formData, minPurchaseAmount: value })}
              type="number"
              autoComplete="off"
              disabled={loading}
            />

            <TextField
              label="Límite de uso"
              value={formData.usageLimit}
              onChange={(value) => setFormData({ ...formData, usageLimit: value })}
              type="number"
              autoComplete="off"
              disabled={loading}
            />

            <Box>
              <Text as="p" variant="bodyMd">Fecha de inicio</Text>
              <DatePicker
                month={formData.startDate.getMonth()}
                year={formData.startDate.getFullYear()}
                onMonthChange={(month, year) => {
                  const newDate = new Date(formData.startDate);
                  newDate.setMonth(month);
                  newDate.setFullYear(year);
                  setFormData({ ...formData, startDate: newDate });
                }}
                selected={{
                  start: formData.startDate,
                  end: formData.startDate
                }}
                onChange={(range) => {
                  if (range.start) {
                    setFormData({ ...formData, startDate: range.start });
                  }
                }}
              />
            </Box>

            <Box>
              <Text as="p" variant="bodyMd">Fecha de expiración</Text>
              <DatePicker
                month={formData.expiryDate.getMonth()}
                year={formData.expiryDate.getFullYear()}
                onMonthChange={(month, year) => {
                  const newDate = new Date(formData.expiryDate);
                  newDate.setMonth(month);
                  newDate.setFullYear(year);
                  setFormData({ ...formData, expiryDate: newDate });
                }}
                selected={{
                  start: formData.expiryDate,
                  end: formData.expiryDate
                }}
                onChange={(range) => {
                  if (range.start) {
                    setFormData({ ...formData, expiryDate: range.start });
                  }
                }}
              />
            </Box>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
};