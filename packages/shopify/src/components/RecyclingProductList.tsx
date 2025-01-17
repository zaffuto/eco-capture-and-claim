import React from 'react';
// import {
//   Card,
//   ResourceList,
//   ResourceItem,
//   Text,
//   Badge,
//   Button,
//   Box,
//   InlineStack,
// } from '@shopify/polaris';
import { useShopifyAuth } from '../hooks/useShopifyAuth';

interface RecyclingProduct {
  id: string;
  title: string;
  certificateId: string;
  status: 'active' | 'used' | 'expired';
  recyclingDate: string;
}

export function RecyclingProductList() {
  // const { isAuthenticated } = useShopifyAuth();

  // if (!isAuthenticated) {
  //   return <div>Cargando...</div>;
  // }

  // Simple structure for V1.0
  return (
    <div>
      <div>Producto de Reciclaje</div>
      <img src="https://via.placeholder.com/150" alt="Producto de Reciclaje" />
      <div>Detalles del producto aquí</div>
    </div>
  );
}

// Commented out problematic JSX
// const renderItem = (item: RecyclingProduct) => {
//   const { id, title, certificateId, status, recyclingDate } = item;
//   return (
//     <div>
//       <div>
//         <div>{title}</div>
//         <div>Certificado: {certificateId}</div>
//         <div>Fecha de reciclaje: {new Date(recyclingDate).toLocaleDateString()}</div>
//       </div>
//       <div>
//         <div>{statusMap[status].label}</div>
//         <div>Ver detalles</div>
//       </div>
//     </div>
//   );
// }
