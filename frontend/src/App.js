import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/User/Login';
import ForgotPassword from './components/User/ForgotPassword';
import Verification from './components/User/Verification';
import ResetPassword from './components/User/ResetPassword';
import Layout from './components/Layout';
import LayoutWorker from './components/LayoutWorker';
import LayoutManager from './components/LayoutManager';
import AdminWelcome from './components/AdminWelcome';
import UserManagement from './components/User/UserManagement';
import SupplierManagement from './components/User/SupplierManagement';
import ManagerWelcome from './components/ManagerWelcome';
import WorkerWelcome from './components/WorkerWelcome';
import AttendanceManagement from './components/Attendance/AttendanceManagement';
import AdminAttendanceTable from './components/Attendance/AdminAttendanceTable';
import ManagerAttendanceTable from './components/Attendance/ManagerAttendanceTable';
import LeaveManagementForm from './components/Attendance/LeaveManagementForm';
import LeaveTable from './components/Attendance/LeaveTable';
import AdminLeaveTable from './components/Attendance/AdminLeaveTable';
import EditLeaveForm from './components/Attendance/EditLeaveForm';
import FuelInventoryPage from './components/inventories/FuelInventoryPage';
import AddItemPage from './components/inventories/AddItemPage';
import EditItemPage from './components/inventories/EditItemPage';
import InventoryFirstPage from './components/inventories/InventoryFirstPage';
import ShopInventoryPage from './components/inventories/ShopInventoryPage';
import AddShopItemPage from './components/inventories/AddShopItemPage';
import EditShopItemPage from './components/inventories/EditShopItemPage';
import ShopSalesManagement from './components/Shop sale/ShopSalesManagement';
import SalesRecordsPage from './components/Shop sale/SalesRecordsPage';

import BillGeneration from './components/promotions/BillGeneration';
import FuelSalesPage from './components/Fuel Sale/FuelSalesPage';
import WorkerSalesPage from './components/Fuel Sale/WorkerSalesPage';
import FuelSalesRecordPage from './components/Fuel Sale/FuelSalesRecordsPage';
import PriceRecordsPage from './components/Fuel Sale/PriceRecordsPage';
import Dashboard from './components/inventories/Dashboard';
import DashboardShop from './components/inventories/DashboardShop';

import CheckoutPage from './components/Shop sale/CheckoutPage';
import Charts from './components/User/Charts';
import SalesFirstPage from './components/SalesFirstPage'
import NotFound from './components/NotFound'; // Import NotFound component
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PromoDetails from './components/promotions/PromoDetails';
import UpdatePromo from './components/promotions/UpdatePromo';
import DeletePromo from './components/promotions/DeletePromo';
import AddPromo from './components/promotions/AddPromo';
import OrderManagementPage from './components/Order management/OrderManagementPage';
import AddNewOrdersPage from './components/Order management/AddNewOrdersPage';
import OrderManagementShopPage from './components/Order management/OrderManagementShopPage';
import OrderNavigationPage from './components/Order management/OrderNavigationPage';
import AddInventory from './pages/admin/Inventory/add_inventory';
import ViewInventory from './pages/admin/Inventory/view_inventory';
import UpdateInventory from './pages/admin/Inventory/update_inventory';
import AddPackage from './pages/admin/Package/add_package';
import ViewPackages from './pages/admin/Package/view_package';
import UpdatePackage from './pages/admin/Package/update_package';
import DisplayPackages from './pages/user/display_package';
import AddBill from './pages/admin/Bill/add_bill';
import BillShow from './components/Shop sale/BillShow';
import UpdateBill from './pages/admin/Bill/update_bill';
import BillAnalysis from './pages/admin/Bill/bill_analysis';
import BillPage from './pages/admin/Bill/bill_page';
import ViewBill from './pages/admin/Bill/view_bills';
import LowStockOrdersPage from './components/Order management/LowStockOrderPage';
import OrderTablePage from './components/Order management/OrderTableComponent';
import AllOrdersPage from './components/Order management/AllOrdersPage';
import SupplierLogin from './components/User/SupplierLogin';
import AcceptOrderForm from './components/User/AcceptOrderForm';
import AdminDashboard from './components/inventories/AdminDashboard';
import SupplierSelfRegister from './components/User/SupplierRegister';
import SupplierDashboard from './components/User/SupplierDashboard';
import AdminShopOrdersDashboard from './components/inventories/AdminShopOrdersDashboard';
import OrdersPieChartPage from './components/Order management/OrdersPieChartPage';
import OrderedItemsBarChart from './components/Order management/OrderBarChartPage';
import ManagerFuelInventory from './components/inventories/ManagerFuelInventory';
import ManagerShopInventory from './components/inventories/ManagerShopInventory';
import ManagerFuelSale from './components/Fuel Sale/ManagerFuelSale';
import ManagerSale from './components/Shop sale/ManagerShopSale';
import ManagerOrder from './components/Order management/ManagerOrder';
import Managershop from './components/Order management/ManagerShopOrder';
import SalaryManagement from './components/Salary/SalaryManagement';
import UserTable from './components/User/UserTable';
import AttendancePieChart from './components/Attendance/AttendancePieChart';





const App = () => {
  const [items, setItems] = useState([]);
  const [userRole, setUserRole] = useState(null);

  const handleAddItem = (newItem) => {
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (updatedItem) => {
    setItems(items.map(item => item._id === updatedItem._id ? updatedItem : item));
  };

  return (
    <Router>
      <Routes>
      <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/self" element={<SupplierSelfRegister />} /> 
        <Route path="/SupplierLogin" element={<SupplierLogin />} /> 
        <Route path="/SupplierDashboard" element={<SupplierDashboard />} /> 
       
          
            {/* Admin Routes */}
            
         <Route path="/admin-welcome" element={<Layout />}>

         <Route index element={<AdminWelcome />} />
                <Route path="user-management" element={<UserManagement />} />
                <Route path="supplier-management" element={<SupplierManagement />} />
                <Route path="charts" element={<Charts />} />
                <Route path="sales-first" element={<SalesFirstPage />} />
                <Route path="attendance" element={<AdminAttendanceTable />} />
                <Route path="leaveTable" element={<AdminLeaveTable />} />
                <Route path="fuel-sales-records" element={<FuelSalesRecordPage />} />
                <Route path="add-shop-item" element={<AddShopItemPage onAddItem={handleAddItem} />} />
                <Route path="fuel-sale" element={<FuelSalesPage />} />
                <Route path="edit-shop-item/:id" element={<EditShopItemPage items={items} onUpdateItem={handleUpdateItem} />} />
                <Route path="inventory-first" element={<InventoryFirstPage />} />
                <Route path="fuel-inventory" element={<FuelInventoryPage items={items} />} />
                <Route path="edit-item/:id" element={<EditItemPage onUpdateItem={handleUpdateItem} />} />
                <Route path="dashboard" element={<Dashboard items={items} />} />
                <Route path="dashboardS" element={<DashboardShop items={items} />} />
                <Route path="add-item" element={<AddItemPage onAddItem={handleAddItem} />} />
                <Route path="edit-item/:id" element={<EditItemPage onUpdateItem={handleUpdateItem} />} />
                <Route path="shop-inventory" element={<ShopInventoryPage items={items} />} />
                <Route path="shop-sale" element={<ShopSalesManagement />} />
                <Route path="sales-records" element={<SalesRecordsPage />} />
                <Route path="order" element={<OrderManagementPage />} />
                <Route path="orderTable" element={<OrderTablePage />} />
                <Route path="OrderNav" element={<OrderNavigationPage />} />
                <Route path="low" element={<LowStockOrdersPage />} />
                <Route path="NeworderShop" element={<OrderManagementShopPage />} />
                <Route path="allOrders" element={<OrderTablePage />} />
               <Route path="allOrdersFuel" element={<AllOrdersPage />} />
               <Route path="Acceptorder" element={<AcceptOrderForm />} />
                <Route path="BillShow" element={<BillShow/>} />
                <Route path="AdminShop" element={<AdminShopOrdersDashboard/>} />
                <Route path="addOrder" element={<AddNewOrdersPage />} />
                <Route path="ReceivedOrder" element={<AdminDashboard />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="price-records" element={<PriceRecordsPage />} />
                <Route path="bill-generation" element={<BillGeneration />} />
                <Route path="addPromo" element={<AddPromo />} />
                <Route path="PromoDetails" element={<PromoDetails />} />
               <Route path="UpdatePromo/:id" element={<UpdatePromo />} />
               
               <Route path="deletePromo/:id" element={<DeletePromo />} />
               <Route path="view" element={<ViewPackages />} />  
      <Route path="add-inventory" element={<AddInventory />} /> 
      <Route path="view-inventory" element={<ViewInventory />} /> 
      <Route path="update-inventory/:id" element={<UpdateInventory />} /> 
      <Route path="add-package" element={<AddPackage />} />
      <Route path="view-packages" element={<ViewPackages />} /> 
      <Route path="update-package/:id" element={<UpdatePackage />} />    
      <Route path="display-packages" element={<DisplayPackages />} /> 
      <Route path="add-bill" element={<AddBill />} /> 
      <Route path="view-bills" element={<ViewBill />} /> 
      <Route path="update-bill/:id" element={<UpdateBill />} /> 
      <Route path="bill/:billId" element={<BillPage />} />
      <Route path="bill-analysis" element={<BillAnalysis />} />  
      <Route path="OrderPie" element={<OrdersPieChartPage />} />  
      <Route path="OrderBar" element={<OrderedItemsBarChart />} />  
      <Route path="UserTable" element={<UserTable />} />  
      <Route path="APie" element={<AttendancePieChart />} />  
      <Route path="Salary" element={<SalaryManagement />} />  

</Route>
          

            {/* Manager Routes */}
            <Route path="/manager-welcome" element={<LayoutManager />}>
            <Route index element={<ManagerWelcome />} />
                <Route path="attendance-management" element={<AttendanceManagement />} />
                <Route path="attendanceM" element={<ManagerAttendanceTable />} />
                <Route path="leave" element={<LeaveManagementForm />} />
                <Route path="leave-records" element={<LeaveTable />} />
                <Route path="inventory-first" element={<InventoryFirstPage />} />
                <Route path="fuel-inventory" element={<FuelInventoryPage items={items} />} />
                <Route path="add-item" element={<AddItemPage onAddItem={handleAddItem} />} />
                <Route path="edit-item/:id" element={<EditItemPage onUpdateItem={handleUpdateItem} />} />
                <Route path="shop-inventory" element={<ShopInventoryPage items={items} />} />
                <Route path="shop-sale" element={<ShopSalesManagement />} />
                <Route path="Charts" element={<Charts />} />
                <Route path="MF" element={<ManagerFuelInventory />} />
                <Route path="MS" element={<ManagerShopInventory />} />
                <Route path="MFS" element={<ManagerFuelSale />} />
                <Route path="ManSale" element={<ManagerSale />} />
                <Route path="ManOrder" element={<ManagerOrder />} />
                <Route path="MShop" element={<Managershop />} />
                <Route path="UserTable" element={<UserTable />} />  
              </Route>
            

            {/* Worker Routes */}
            <Route path="/worker-welcome" element={<LayoutWorker />}>
            <Route index element={<WorkerWelcome />} />
                <Route path="attendance-management" element={<AttendanceManagement />} />
                <Route path="leave" element={<LeaveManagementForm />} />
                <Route path="leave-records" element={<LeaveTable />} />
                <Route path="edit/:id" element={<EditLeaveForm />} />
                <Route path="worker-sales" element={<WorkerSalesPage />} />
              </Route>
            
          {/* Fallback route for non-existent paths */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    <ToastContainer /> {/* Include ToastContainer */}
  </Router>
);
};

export default App;
