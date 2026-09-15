import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { inventoryAPI } from '../api';
import './Inventory.css';

const Inventory = () => {
  const [stats, setStats] = useState({
    total_products: 52,
    total_stock: 14721,
    low_stock: 14,
    out_of_stock: 2,
    inventory_value: 147570,
    reorder_required: 2,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_code: '',
    category: 'Apparel',
    buying_price: '',
    selling_price: '',
    quantity: '',
    threshold_value: '10',
    supplier: '',
  });

  useEffect(() => {
    loadInventoryData();
    loadProducts();
  }, [currentPage, searchTerm]);

  const loadInventoryData = async () => {
    const response = await inventoryAPI.getStats();
    if (response.data?.success) {
      setStats(response.data.data);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    const response = await inventoryAPI.getProducts(
      currentPage,
      10,
      searchTerm,
    );
    if (response.data?.success) {
      setProducts(response.data.data);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages || 1);
      }
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      product_code: 'PRD' + Math.floor(100 + Math.random() * 900),
      category: 'Apparel',
      buying_price: '',
      selling_price: '',
      quantity: '',
      threshold_value: '20',
      supplier: '',
    });
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      product_name: prod.product_name,
      product_code: prod.product_code,
      category: prod.category,
      buying_price: prod.buying_price,
      selling_price: prod.selling_price || '',
      quantity: prod.quantity,
      threshold_value: prod.threshold_value || '10',
      supplier: prod.supplier || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      buying_price: parseFloat(formData.buying_price),
      selling_price: parseFloat(formData.selling_price) || 0,
      quantity: parseInt(formData.quantity),
      threshold_value: parseInt(formData.threshold_value),
    };

    if (editingProduct) {
      productData.id = editingProduct.id;
      await inventoryAPI.updateProduct(productData);
      alert('Product updated successfully');
    } else {
      await inventoryAPI.addProduct(productData);
      alert('Product added successfully');
    }

    setShowModal(false);
    loadProducts();
    loadInventoryData();
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        'Are you sure you want to remove this item from the warehouse catalog?',
      )
    ) {
      await inventoryAPI.deleteProduct(id);
      loadProducts();
      loadInventoryData();
    }
  };

  return (
    <Layout>
      <div className="inventory-page">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Inventory & Material Management</h1>
            <p className="page-subtitle">
              Track raw fabrics, finished apparel inventory, reorder thresholds,
              and valuation
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={openAddModal}>
              <i className="fas fa-plus-circle"></i> Add Product
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => alert('Exporting Inventory Catalog...')}
            >
              <i className="fas fa-file-export"></i> Export CSV
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="inventory-stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Total Products</span>
              <div className="stat-card-icon icon-blue">
                <i className="fas fa-boxes"></i>
              </div>
            </div>
            <div className="stat-card-value">{stats.total_products}</div>
            <div className="stat-card-subtitle">Active Catalog Items</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Total Stock Units</span>
              <div className="stat-card-icon icon-green">
                <i className="fas fa-cubes"></i>
              </div>
            </div>
            <div className="stat-card-value">
              {Number(stats.total_stock).toLocaleString()}
            </div>
            <div className="stat-card-subtitle">Units in warehouse</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Low Stock Alert</span>
              <div className="stat-card-icon icon-yellow">
                <i className="fas fa-exclamation-circle"></i>
              </div>
            </div>
            <div className="stat-card-value">{stats.low_stock}</div>
            <div className="stat-card-subtitle">Near reorder point</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Inventory Valuation</span>
              <div className="stat-card-icon icon-green">
                <i className="fas fa-dollar-sign"></i>
              </div>
            </div>
            <div className="stat-card-value">
              ${Number(stats.inventory_value).toLocaleString()}
            </div>
            <div className="stat-card-subtitle">Total asset value</div>
          </div>
        </div>

        {/* Products Table Card */}
        <div className="attendance-table-card">
          <div className="table-header-row">
            <h2>Inventory Catalog</h2>
            <div className="table-search-box">
              <input
                type="text"
                placeholder="Search products by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ width: '280px', height: '36px' }}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="c2s-table">
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Buying Price</th>
                  <th>Selling Price</th>
                  <th>In Stock</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <strong>{prod.product_code}</strong>
                    </td>
                    <td>{prod.product_name}</td>
                    <td>{prod.category}</td>
                    <td>${Number(prod.buying_price).toFixed(2)}</td>
                    <td>${Number(prod.selling_price || 0).toFixed(2)}</td>
                    <td>
                      <strong>{prod.quantity}</strong>
                    </td>
                    <td>{prod.supplier || 'N/A'}</td>
                    <td>
                      <span
                        className={`badge ${
                          prod.status === 'in_stock'
                            ? 'badge-success'
                            : prod.status === 'low_stock'
                              ? 'badge-warning'
                              : 'badge-danger'
                        }`}
                      >
                        {prod.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(prod)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(prod.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal (Figma node-id=1-61134) */}
      {showModal && (
        <div className="c2s-modal-overlay">
          <div className="c2s-modal-dialog">
            <div className="c2s-modal-header">
              <h2>
                {editingProduct
                  ? 'Edit Product Item'
                  : 'Add New Inventory Product'}
              </h2>
              <button
                className="c2s-modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="c2s-modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.product_name}
                    onChange={(e) =>
                      setFormData({ ...formData, product_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Code (SKU)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.product_code}
                    onChange={(e) =>
                      setFormData({ ...formData, product_code: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="Apparel">Apparel</option>
                    <option value="Raw Material">
                      Raw Material (Fabric/Yarn)
                    </option>
                    <option value="Trim & Accessories">
                      Trim & Accessories (Buttons/Zips)
                    </option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Buying Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.buying_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buying_price: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Selling Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.selling_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selling_price: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Low Stock Threshold</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.threshold_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          threshold_value: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Supplier / Mill Source</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="c2s-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;
