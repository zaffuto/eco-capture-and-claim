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
  Stack,
  DataTable,
  Banner,
} from '@shopify/polaris';

const discountService = new DiscountService();

export const EcoCuponManager: React.FC = () => {
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
    loadCupons();
  }, []);

  const loadCupons = async () => {
    try {
      const { data, error } = await supabase
        .from('eco_cupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCupons(data);
    } catch (err) {
      setError('Error al cargar cupones');
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      await discountService.createEcoCupon({
        ...formData,
        userId: (await supabase.auth.getUser()).data.user?.id,
      });

      setIsModalOpen(false);
      loadCupons();
    } catch (err) {
      setError('Error al crear el cupón');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      setLoading(true);
      await discountService.deactivateEcoCupon(id);
      loadCupons();
    } catch (err) {
      setError('Error al desactivar el cupón');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rows = cupons.map((cupon) => [
    cupon.code,
    cupon.discount_type === 'percentage' ? `${cupon.discount_value}%` : `$${cupon.discount_value}`,
    cupon.min_purchase_amount ? `$${cupon.min_purchase_amount}` : 'N/A',
    cupon.times_used,
    cupon.status,
    <Button
      disabled={cupon.status !== 'active'}
      onClick={() => handleDeactivate(cupon.id)}
    >
      Desactivar
    </Button>,
  ]);

  return (
    <div>
      {error && (
        <Banner status="critical" onDismiss={() => setError('')}>
          <p>{error}</p>
        </Banner>
      )}

      <Card sectioned>
        <Stack distribution="equalSpacing">
          <Text variant="headingLg">Eco Cupones</Text>
          <Button primary onClick={() => setIsModalOpen(true)}>
            Crear Cupón
          </Button>
        </Stack>

        <DataTable
          columnContentTypes={['text', 'text', 'text', 'numeric', 'text', 'text']}
          headings={['Código', 'Descuento', 'Mínimo de compra', 'Usos', 'Estado', 'Acciones']}
          rows={rows}
        />
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
          <Stack vertical>
            <TextField
              label="Código"
              value={formData.code}
              onChange={(value) => setFormData({ ...formData, code: value })}
              autoComplete="off"
            />

            <Select
              label="Tipo de descuento"
              options={[
                { label: 'Porcentaje', value: 'percentage' },
                { label: 'Monto fijo', value: 'fixed_amount' },
              ]}
              value={formData.discountType}
              onChange={(value) => setFormData({ ...formData, discountType: value })}
            />

            <TextField
              label="Valor del descuento"
              value={formData.discountValue}
              onChange={(value) => setFormData({ ...formData, discountValue: value })}
              type="number"
            />

            <TextField
              label="Monto mínimo de compra"
              value={formData.minPurchaseAmount}
              onChange={(value) => setFormData({ ...formData, minPurchaseAmount: value })}
              type="number"
            />

            <TextField
              label="Límite de uso"
              value={formData.usageLimit}
              onChange={(value) => setFormData({ ...formData, usageLimit: value })}
              type="number"
            />

            <DatePicker
              month={formData.startDate.getMonth()}
              year={formData.startDate.getFullYear()}
              onChange={(date) => setFormData({ ...formData, startDate: date })}
              selected={formData.startDate}
              label="Fecha de inicio"
            />

            <DatePicker
              month={formData.expiryDate.getMonth()}
              year={formData.expiryDate.getFullYear()}
              onChange={(date) => setFormData({ ...formData, expiryDate: date })}
              selected={formData.expiryDate}
              label="Fecha de expiración"
            />
          </Stack>
        </Modal.Section>
      </Modal>
    </div>
  );
};
