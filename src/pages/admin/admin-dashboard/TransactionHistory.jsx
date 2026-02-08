import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';

function TransactionHistory() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Expanded Transaction Data
    const transactions = [
        { id: 'TXN-8821', userCompany: 'OceanHire Agency', type: 'Subscription', date: 'Oct 24, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$499.00', amountColor: 'text-green-600' },
        { id: 'TXN-8822', userCompany: 'John Smith', type: 'Course Purchase', date: 'Oct 24, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$120.00', amountColor: 'text-green-600' },
        { id: 'TXN-8823', userCompany: 'Blue Wave Shipping', type: 'Subscription', date: 'Oct 23, 2024', status: 'Failed', statusColor: 'text-red-600 bg-red-50', amount: '$899.00', amountColor: 'text-green-600' },
        { id: 'TXN-8824', userCompany: 'Sarah Jenkins', type: 'Course Purchase', date: 'Oct 23, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$350.00', amountColor: 'text-green-600' },
        { id: 'TXN-8825', userCompany: 'Maritime Training Inst', type: 'Payout', date: 'Oct 22, 2024', status: 'Processing', statusColor: 'text-blue-600 bg-blue-50', amount: '-$1,250.00', amountColor: 'text-red-600' },
        { id: 'TXN-8826', userCompany: 'Global Logistics', type: 'Ads Promotion', date: 'Oct 22, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$200.00', amountColor: 'text-green-600' },
        { id: 'TXN-8827', userCompany: 'David Lee', type: 'Course Purchase', date: 'Oct 21, 2024', status: 'Pending', statusColor: 'text-orange-600 bg-orange-50', amount: '$150.00', amountColor: 'text-green-600' },
        { id: 'TXN-8828', userCompany: 'Sea Corp', type: 'Subscription', date: 'Oct 21, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$499.00', amountColor: 'text-green-600' },
        { id: 'TXN-8829', userCompany: 'Mike Ross', type: 'Course Purchase', date: 'Oct 20, 2024', status: 'Failed', statusColor: 'text-red-600 bg-red-50', amount: '$120.00', amountColor: 'text-green-600' },
        { id: 'TXN-8830', userCompany: 'Northern Shipping', type: 'Ads Promotion', date: 'Oct 20, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$300.00', amountColor: 'text-green-600' },
        { id: 'TXN-8831', userCompany: 'Emma Watson', type: 'Course Purchase', date: 'Oct 19, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$120.00', amountColor: 'text-green-600' },
        { id: 'TXN-8832', userCompany: 'Ocean Training', type: 'Payout', date: 'Oct 19, 2024', status: 'Processing', statusColor: 'text-blue-600 bg-blue-50', amount: '-$850.00', amountColor: 'text-red-600' },
        { id: 'TXN-8833', userCompany: 'Pacific Line', type: 'Subscription', date: 'Oct 18, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$899.00', amountColor: 'text-green-600' },
        { id: 'TXN-8834', userCompany: 'Tom Hardy', type: 'Course Purchase', date: 'Oct 18, 2024', status: 'Pending', statusColor: 'text-orange-600 bg-orange-50', amount: '$150.00', amountColor: 'text-green-600' },
        { id: 'TXN-8835', userCompany: 'Cargo Masters', type: 'Ads Promotion', date: 'Oct 17, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$250.00', amountColor: 'text-green-600' },
        { id: 'TXN-8836', userCompany: 'Emily Blunt', type: 'Course Purchase', date: 'Oct 17, 2024', status: 'Failed', statusColor: 'text-red-600 bg-red-50', amount: '$120.00', amountColor: 'text-green-600' },
        { id: 'TXN-8837', userCompany: 'Atlantic Inc', type: 'Subscription', date: 'Oct 16, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$499.00', amountColor: 'text-green-600' },
        { id: 'TXN-8838', userCompany: 'John Wick', type: 'Course Purchase', date: 'Oct 16, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$120.00', amountColor: 'text-green-600' },
        { id: 'TXN-8839', userCompany: 'Maritime Safety', type: 'Payout', date: 'Oct 15, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '-$2,100.00', amountColor: 'text-red-600' },
        { id: 'TXN-8840', userCompany: 'Chris Evans', type: 'Course Purchase', date: 'Oct 15, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$120.00', amountColor: 'text-green-600' },
        { id: 'TXN-8841', userCompany: 'Evergreen Marine', type: 'Subscription', date: 'Oct 14, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$899.00', amountColor: 'text-green-600' },
        { id: 'TXN-8842', userCompany: 'Scarlett Jo', type: 'Course Purchase', date: 'Oct 14, 2024', status: 'Pending', statusColor: 'text-orange-600 bg-orange-50', amount: '$150.00', amountColor: 'text-green-600' },
        { id: 'TXN-8843', userCompany: 'Naval Tech', type: 'Ads Promotion', date: 'Oct 13, 2024', status: 'Failed', statusColor: 'text-red-600 bg-red-50', amount: '$300.00', amountColor: 'text-green-600' },
        { id: 'TXN-8844', userCompany: 'Robert Downey', type: 'Course Purchase', date: 'Oct 13, 2024', status: 'Completed', statusColor: 'text-green-600 bg-green-50', amount: '$120.00', amountColor: 'text-green-600' },
        { id: 'TXN-8845', userCompany: 'Seafarer Union', type: 'Payout', date: 'Oct 12, 2024', status: 'Processing', statusColor: 'text-blue-600 bg-blue-50', amount: '-$500.00', amountColor: 'text-red-600' },
    ];

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const matchesSearch =
                transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.userCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.type.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'All' || transaction.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus]);

    // Pagination Logic
    const totalItems = filteredTransactions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Reset pagination when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const handleExport = () => {
        const csvContent = [
            ['Transaction ID', 'User / Company', 'Type', 'Date', 'Status', 'Amount'],
            ...filteredTransactions.map(t => [
                t.id,
                t.userCompany,
                t.type,
                t.date,
                t.status,
                t.amount
            ])
        ].map(e => e.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('blob');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions_export.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl">
            {/* Header */}
            <div className="mb-4">
                <button
                    onClick={() => navigate('/admin-dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[28px] font-bold text-gray-900">Transaction History</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Monitor revenue, payouts, and financial activity</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f] w-64"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Button */}
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-colors ${filterStatus !== 'All'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Filter className="h-4 w-4" />
                                {filterStatus === 'All' ? 'Filter' : filterStatus}
                            </button>

                            {isFilterOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsFilterOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
                                        {['All', 'Completed', 'Processing', 'Pending', 'Failed'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setFilterStatus(status);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filterStatus === status ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-700'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Export CSV Button */}
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#1e5a8f] text-white rounded-xl text-sm font-bold hover:bg-[#164a7a] transition-colors shadow-sm"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Transaction ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    User / Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedTransactions.length > 0 ? (
                                paginatedTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {transaction.id}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {transaction.userCompany}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {transaction.type}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {transaction.date}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${transaction.statusColor}`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-3 whitespace-nowrap text-sm font-bold text-right ${transaction.amountColor}`}>
                                            {transaction.amount}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No transactions found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing {startItem}-{endItem} of {totalItems} transactions
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === page
                                    ? 'bg-[#1e5a8f] text-white'
                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransactionHistory;
