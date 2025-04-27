import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TrialComponent = () => {
  const [state, setState] = useState({
    data: [],
    loading: true,
    error: null,
    count: 0,
    isVisible: false,
    selectedItem: null,
    searchQuery: '',
    filterOptions: {},
    pagination: { page: 1, limit: 10 },
    sortConfig: { key: 'name', direction: 'asc' }
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await api.get('/api/data', {
        params: {
          page: state.pagination.page,
          limit: state.pagination.limit,
          search: state.searchQuery,
          ...state.filterOptions
        }
      });
      setState(prev => ({
        ...prev,
        data: response.data,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      toast.error('Failed to fetch data');
    }
  }, [state.pagination, state.searchQuery, state.filterOptions]);

  useEffect(() => {
    fetchData();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchData]);

  const handleSearch = useCallback((query) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  const handleFilter = useCallback((filters) => {
    setState(prev => ({
      ...prev,
      filterOptions: filters,
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  const handleSort = useCallback((key) => {
    setState(prev => ({
      ...prev,
      sortConfig: {
        key,
        direction: prev.sortConfig.key === key && prev.sortConfig.direction === 'asc' ? 'desc' : 'asc'
      }
    }));
  }, []);

  const handlePagination = useCallback((page) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  }, []);

  const handleItemClick = useCallback((item) => {
    setState(prev => ({
      ...prev,
      selectedItem: item,
      isVisible: true
    }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItem: null,
      isVisible: false
    }));
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    try {
      await api.post('/api/data', formData);
      toast.success('Data submitted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to submit data');
    }
  }, [fetchData]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/api/data/${id}`);
      toast.success('Item deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  }, [fetchData]);

  const handleUpdate = useCallback(async (id, data) => {
    try {
      await api.put(`/api/data/${id}`, data);
      toast.success('Item updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update item');
    }
  }, [fetchData]);

  const handleExport = useCallback(async () => {
    try {
      const response = await api.get('/api/data/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to export data');
    }
  }, []);

  const handleImport = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/api/data/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Data imported successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to import data');
    }
  }, [fetchData]);

  const handleDragStart = useCallback((e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('text/plain'));
    // Handle drop logic
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleCloseModal();
    }
  }, [handleCloseModal]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight - scrollTop === clientHeight) {
        handlePagination(state.pagination.page + 1);
      }
    }
  }, [handlePagination, state.pagination.page]);

  const handleResize = useCallback(() => {
    // Handle window resize logic
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll);
      return () => {
        containerRef.current?.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  const memoizedData = useMemo(() => {
    return state.data.map(item => ({
      ...item,
      processed: true
    }));
  }, [state.data]);

  const memoizedFilteredData = useMemo(() => {
    return memoizedData.filter(item => {
      if (state.searchQuery) {
        return item.name.toLowerCase().includes(state.searchQuery.toLowerCase());
      }
      return true;
    });
  }, [memoizedData, state.searchQuery]);

  const memoizedSortedData = useMemo(() => {
    return [...memoizedFilteredData].sort((a, b) => {
      if (state.sortConfig.direction === 'asc') {
        return a[state.sortConfig.key] > b[state.sortConfig.key] ? 1 : -1;
      }
      return a[state.sortConfig.key] < b[state.sortConfig.key] ? 1 : -1;
    });
  }, [memoizedFilteredData, state.sortConfig]);

  const memoizedPaginatedData = useMemo(() => {
    const start = (state.pagination.page - 1) * state.pagination.limit;
    const end = start + state.pagination.limit;
    return memoizedSortedData.slice(start, end);
  }, [memoizedSortedData, state.pagination]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Trial Component</h1>
            <div className="flex gap-4">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Export
              </button>
              <input
                type="file"
                onChange={(e) => handleImport(e.target.files[0])}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
              >
                Import
              </label>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={state.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div
            ref={containerRef}
            className="overflow-auto max-h-[600px]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {state.loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : state.error ? (
              <div className="text-red-500 text-center">{state.error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memoizedPaginatedData.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleItemClick(item)}
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 mt-2">{item.description}</p>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(item.id, { ...item, name: 'Updated' });
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              {Array.from(
                { length: Math.ceil(memoizedSortedData.length / state.pagination.limit) },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePagination(page)}
                  className={`px-4 py-2 rounded ${
                    page === state.pagination.page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {state.isVisible && state.selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">{state.selectedItem.name}</h2>
              <p className="text-gray-600">{state.selectedItem.description}</p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Additional Components
const SecondaryComponent = ({ data, onAction }) => {
  const [localState, setLocalState] = useState({
    expanded: false,
    selected: null,
    inputValue: '',
    validation: { isValid: true, message: '' }
  });

  const handleExpand = useCallback(() => {
    setLocalState(prev => ({ ...prev, expanded: !prev.expanded }));
  }, []);

  const handleSelect = useCallback((item) => {
    setLocalState(prev => ({ ...prev, selected: item }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setLocalState(prev => ({
      ...prev,
      inputValue: value,
      validation: {
        isValid: value.length > 0,
        message: value.length > 0 ? '' : 'Input is required'
      }
    }));
  }, []);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Secondary Component</h3>
        <button
          onClick={handleExpand}
          className="p-2 hover:bg-gray-100 rounded"
        >
          {localState.expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {localState.expanded && (
        <div className="mt-4 space-y-4">
          <input
            type="text"
            value={localState.inputValue}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded ${
              !localState.validation.isValid ? 'border-red-500' : ''
            }`}
          />
          {!localState.validation.isValid && (
            <p className="text-red-500 text-sm">{localState.validation.message}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            {data.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`p-4 border rounded cursor-pointer ${
                  localState.selected?.id === item.id ? 'bg-blue-50 border-blue-500' : ''
                }`}
              >
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FormComponent = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    preferences: {
      notifications: true,
      newsletter: false,
      marketing: false
    }
  });

  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zip) newErrors.zip = 'ZIP code is required';
    if (!formData.country) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [formData, onSubmit, validateForm]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : ''
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : ''
            }`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : ''
            }`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.address ? 'border-red-500' : ''
            }`}
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.city ? 'border-red-500' : ''
            }`}
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.state ? 'border-red-500' : ''
            }`}
          />
          {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.zip ? 'border-red-500' : ''
            }`}
          />
          {errors.zip && <p className="mt-1 text-sm text-red-600">{errors.zip}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.country ? 'border-red-500' : ''
            }`}
          />
          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Preferences</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="notifications"
              checked={formData.preferences.notifications}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2">Receive Notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="newsletter"
              checked={formData.preferences.newsletter}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2">Subscribe to Newsletter</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="marketing"
              checked={formData.preferences.marketing}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2">Receive Marketing Emails</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

const ChartComponent = ({ data }) => {
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetrics, setSelectedMetrics] = useState(['value1', 'value2']);

  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date),
      formattedValue: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(item.value)
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    return chartData.filter(item => {
      const now = new Date();
      const itemDate = new Date(item.date);
      switch (timeRange) {
        case 'week':
          return now - itemDate <= 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return now - itemDate <= 30 * 24 * 60 * 60 * 1000;
        case 'year':
          return now - itemDate <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
  }, [chartData, timeRange]);

  const handleChartTypeChange = useCallback((type) => {
    setChartType(type);
  }, []);

  const handleTimeRangeChange = useCallback((range) => {
    setTimeRange(range);
  }, []);

  const handleMetricToggle = useCallback((metric) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metric)) {
        return prev.filter(m => m !== metric);
      }
      return [...prev, metric];
    });
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Data Visualization</h3>
        <div className="flex gap-4">
          <select
            value={chartType}
            onChange={(e) => handleChartTypeChange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="area">Area Chart</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        {['value1', 'value2', 'value3', 'value4'].map(metric => (
          <label key={metric} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedMetrics.includes(metric)}
              onChange={() => handleMetricToggle(metric)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 capitalize">{metric}</span>
          </label>
        ))}
      </div>
      <div className="h-96">
        {/* Chart rendering would go here */}
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chart visualization would appear here</p>
        </div>
      </div>
      <div className="mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              {selectedMetrics.map(metric => (
                <th
                  key={metric}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.date.toLocaleDateString()}
                </td>
                {selectedMetrics.map(metric => (
                  <td
                    key={metric}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {item[metric]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrialComponent;
