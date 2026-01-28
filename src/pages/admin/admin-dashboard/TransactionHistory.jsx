import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

function TransactionHistory() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Transaction Data - Reduced to fit on one screen
    const transactions = [
        {
            id: 'TXN-8821',
            userCompany: 'OceanHire Agency',
            type: 'Subscription',
            date: 'Oct 24, 2024',
            status: 'Completed',
            statusColor: 'text-green-600 bg-green-50',
            amount: '$499.00',
            amountColor: 'text-green-600'
        },
        {
            id: 'TXN-8822',
            userCompany: 'John Smith',
            type: 'Course Purchase',
            date: 'Oct 24, 2024',
            status: 'Completed',
            statusColor: 'text-green-600 bg-green-50',
            amount: '$120.00',
            amountColor: 'text-green-600'
        },
        {
            id: 'TXN-8823',
            userCompany: 'Blue Wave Shipping',
            type: 'Subscription',
            date: 'Oct 23, 2024',
            status: 'Failed',
            statusColor: 'text-red-600 bg-red-50',
            amount: '$899.00',
            amountColor: 'text-green-600'
        },
        {
            id: 'TXN-8824',
            userCompany: 'Sarah Jenkins',
            type: 'Course Purchase',
            date: 'Oct 23, 2024',
            status: 'Completed',
            statusColor: 'text-green-600 bg-green-50',
            amount: '$350.00',
            amountColor: 'text-green-600'
        },
        {
            id: 'TXN-8825',
            userCompany: 'Maritime Training Inst',
            type: 'Payout',
            date: 'Oct 22, 2024',
            status: 'Processing',
            statusColor: 'text-blue-600 bg-blue-50',
            amount: '-$1,250.00',
            amountColor: 'text-red-600'
        }
    ];

    const totalTransactions = 142;
    const itemsPerPage = 5;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalTransactions);

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
                        </div>

                        {/* Filter Button */}
                        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            <Filter className="h-4 w-4" />
                            Filter
                        </button>

                        {/* Export CSV Button */}
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1e5a8f] text-white rounded-xl text-sm font-bold hover:bg-[#164a7a] transition-colors shadow-sm">
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
                            {transactions.map((transaction) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing {startItem}-{endItem} of {totalTransactions} transactions
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={endItem >= totalTransactions}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransactionHistory;
