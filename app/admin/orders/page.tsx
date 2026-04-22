import OrderList from '../../../components/orders/OrderList';

export const metadata = {
    title: 'Admin — Orders'
};

export default function AdminOrdersPage() {
    return (
        <div className="p-6">
            <OrderList />
        </div>
    );
}
