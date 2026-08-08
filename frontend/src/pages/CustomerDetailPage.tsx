import React, { useState, useEffect, useCallback } from 'react';
import { Customer, getCustomerByIdApi, updateCustomerApi, CreateCustomerPayload } from '../services/customerService';
import { CustomerFormModal } from '../components/CustomerFormModal';

interface CustomerDetailPageProps {
  customerId: string;
  userRole?: string;
  onBack: () => void;
}

export const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({
  customerId,
  userRole = 'ADMIN',
  onBack
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const canEdit = userRole === 'ADMIN' || userRole === 'SALES';

  const fetchCustomerDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCustomerByIdApi(customerId);
      if (response.success) {
        setCustomer(response.data);
      }
    } catch (err: any) {
      console.error('Fetch Customer Details Error:', err);
      const msg = err.response?.data?.error?.message || 'Failed to load customer profile.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  const handleUpdateCustomer = async (data: CreateCustomerPayload) => {
    if (customer) {
      await updateCustomerApi(customer.id, data);
      fetchCustomerDetails();
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2" />
        <p className="text-sm">Loading customer profile...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-8">
        <p className="text-rose-600 font-semibold mb-2">{error || 'Customer not found.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm"
        >
          ← Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{customer.customerName}</h1>
            <p className="text-xs text-slate-500 font-medium">{customer.businessName}</p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
          >
            Edit Profile & Notes
          </button>
        )}
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Overview</h2>
          
          <div>
            <label className="text-[11px] text-slate-400 font-medium block uppercase">Customer Type</label>
            <span className="inline-block mt-1 px-2.5 py-1 rounded text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              {customer.customerType}
            </span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block uppercase">Status</label>
            <span className="inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {customer.status}
            </span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block uppercase">GST Number</label>
            <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">
              {customer.gstNumber || 'Not Provided'}
            </p>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block uppercase">Follow-up Date</label>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'None Scheduled'}
            </p>
          </div>
        </div>

        {/* Middle & Right Column: Details & Notes */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact & Address Information */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact & Address Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block uppercase">Mobile Number</label>
                <p className="font-mono font-medium text-slate-900 mt-0.5">{customer.mobile}</p>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block uppercase">Email Address</label>
                <p className="font-medium text-slate-900 mt-0.5">{customer.email}</p>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block uppercase">Billing / Business Address</label>
              <p className="text-sm font-medium text-slate-800 mt-0.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {customer.address}
              </p>
            </div>
          </div>

          {/* Follow-up Interaction Notes */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Follow-up Notes & Log</h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {customer.notes || 'No follow-up notes logged for this customer.'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpdateCustomer}
        initialData={customer}
        title="Edit Customer Details & Notes"
      />
    </div>
  );
};
