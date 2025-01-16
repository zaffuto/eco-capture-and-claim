import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { RecyclingRecord, Certificate } from '@eco/shared';

async function getData() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: records } = await supabase
    .from('recycling_records')
    .select(`
      *,
      certificates (*)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  return records;
}

export default async function DashboardPage() {
  const records = await getData();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard de Reciclaje</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Reciclado</h3>
          <p className="text-3xl font-bold text-blue-600">{records?.length || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Certificados Emitidos</h3>
          <p className="text-3xl font-bold text-green-600">
            {records?.filter(r => r.certificates?.length > 0).length || 0}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {records?.filter(r => !r.certificates?.length).length || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Últimos Registros
          </h3>
        </div>
        
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {records?.map((record) => (
              <li key={record.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Contenedor #{record.container_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {record.certificates?.length ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Certificado emitido
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
