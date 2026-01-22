import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Stock = () => {
    const { canEdit } = useAuth();
    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState(''); // New sort state

    useEffect(() => {
        fetchStocks();
    }, []);

    useEffect(() => {
        filterStocks();
    }, [searchTerm, categoryFilter, statusFilter, sortBy, stocks]);

    const fetchStocks = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/stock');
            setStocks(response.data.data);
            setFilteredStocks(response.data.data);
        } catch (error) {
            console.error('Error fetching stocks:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterStocks = () => {
        let filtered = stocks;

        if (searchTerm) {
            filtered = filtered.filter(stock =>
                stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                stock.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                stock.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter) {
            filtered = filtered.filter(stock => stock.category === categoryFilter);
        }

        if (statusFilter) {
            filtered = filtered.filter(stock => stock.status === statusFilter);
        }

        // Apply sorting
        if (sortBy) {
            filtered = [...filtered].sort((a, b) => {
                switch (sortBy) {
                    case 'status':
                        // Priority: In Stock > Low Stock > Out of Stock > Expired
                        const statusOrder = { 'In Stock': 1, 'Low Stock': 2, 'Out of Stock': 3, 'Expired': 4 };
                        return statusOrder[a.status] - statusOrder[b.status];

                    case 'quantity-asc':
                        return a.quantityInCartons - b.quantityInCartons;

                    case 'quantity-desc':
                        return b.quantityInCartons - a.quantityInCartons;

                    case 'expiry-near':
                        return new Date(a.expiryDate) - new Date(b.expiryDate);

                    case 'expiry-far':
                        return new Date(b.expiryDate) - new Date(a.expiryDate);

                    default:
                        return 0;
                }
            });
        }

        setFilteredStocks(filtered);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`http://localhost:5001/api/stock/${id}`);
                fetchStocks();
            } catch (error) {
                console.error('Error deleting stock:', error);
                alert('Failed to delete stock item');
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            'In Stock': 'badge-success',
            'Low Stock': 'badge-warning',
            'Out of Stock': 'badge-danger',
            'Expired': 'badge-danger'
        };
        return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
    };

    if (loading) {
        return <div className="spinner"></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>Stock Management</h1>
                <p>View and manage your inventory {!canEdit() && <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>Read-Only</span>}</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="input-group" style={{ flex: '1', minWidth: '250px', marginBottom: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search by name, manufacturer, or batch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ minWidth: '150px', marginBottom: 0 }}>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="">All Categories</option>
                            <option value="Medicine">Medicine</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Consumables">Consumables</option>
                            <option value="Surgical">Surgical</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="input-group" style={{ minWidth: '150px', marginBottom: 0 }}>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>

                    <div className="input-group" style={{ minWidth: '180px', marginBottom: 0 }}>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="">Sort By...</option>
                            <option value="status">Status (Priority)</option>
                            <option value="quantity-asc">Quantity (Low to High)</option>
                            <option value="quantity-desc">Quantity (High to Low)</option>
                            <option value="expiry-near">Expiry (Near to Far)</option>
                            <option value="expiry-far">Expiry (Far to Near)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Manufacturer</th>
                                <th>Batch No.</th>
                                <th>Packaging</th>
                                <th>Cartons</th>
                                <th>Total Packs</th>
                                <th>Pack Price</th>
                                <th>Carton Price</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStocks.length === 0 ? (
                                <tr>
                                    <td colSpan="12" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No stock items found
                                    </td>
                                </tr>
                            ) : (
                                filteredStocks.map((stock) => (
                                    <tr key={stock._id}>
                                        <td style={{ fontWeight: 500 }}>{stock.name}</td>
                                        <td>{stock.category}</td>
                                        <td>{stock.manufacturer}</td>
                                        <td>{stock.batchNumber}</td>
                                        <td>
                                            <span className="badge badge-info">
                                                {stock.unitsPerPack}×{stock.packsPerCarton}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{stock.quantityInCartons}</td>
                                        <td>{stock.totalPacks || (stock.packsPerCarton * stock.quantityInCartons)}</td>
                                        <td>₹{stock.packSellingPrice}</td>
                                        <td>₹{stock.cartonSellingPrice || (stock.packSellingPrice * stock.packsPerCarton)}</td>
                                        <td>{new Date(stock.expiryDate).toLocaleDateString()}</td>
                                        <td>{getStatusBadge(stock.status)}</td>
                                        <td>
                                            {canEdit() ? (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                                        onClick={() => handleDelete(stock._id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Stock;
