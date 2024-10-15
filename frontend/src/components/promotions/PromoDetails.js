import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaDownload } from 'react-icons/fa';
import './PromoDetails.css';
import deletePromo from './DeletePromo';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
export default function PromoDetails() {
  const [promo, setPromo] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterValidity, setFilterValidity] = useState('');
  const [filterUsage, setFilterUsage] = useState('');
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const calculateRemainingDays = (endDate) => {
    const now = moment();
    const end = moment(endDate);
    const remainingDays = end.diff(now, 'days');
    return remainingDays > 0 ? remainingDays : 0;
  };
  const [showConfirm, setShowConfirm] = useState(false); // New state for confirmation popup
  const [promoToDelete, setPromoToDelete] = useState(null); // New state to hold promo data before deletion
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Success popup state
  const [showReportSuccessPopup, setShowReportSuccessPopup] = useState(false); // Success popup state for report


 
  useEffect(() => {
    // Fetch promotions from API
    const fetchPromotions = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from local storage
        const response = await axios.get("http://localhost:5000/Promotions/displayPromo", {
          headers: { Authorization: `Bearer ${token}` }, // Set authorization header
        });
        setPromo(response.data);
      } catch (error) {
        alert('Error fetching promotions: ' + error.message);
      }
    };
    fetchPromotions();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };
  
  const handleFilterValidityChange = (e) => {
    setFilterValidity(e.target.value);
  };
  
  const handleFilterUsageChange = (e) => {
    setFilterUsage(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const filteredPromo = promo.filter((promoCode) => {
    const matchesSearchTerm = promoCode.promo_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? promoCode.promo_type === filterType : true;
  
    const remainingDays = moment(promoCode.promo_endDate).diff(moment(), 'days');
    const matchesValidity = !filterValidity || 
      (filterValidity === 'less10' && remainingDays < 10) ||
      (filterValidity === '10to20' && remainingDays >= 10 && remainingDays <= 20) ||
      (filterValidity === '20to30' && remainingDays > 20 && remainingDays <= 30) ||
      (filterValidity === 'more30' && remainingDays > 30);
  
    const matchesUsage = !filterUsage || 
      (filterUsage === 'less5' && promoCode.promo_expire < 5) ||
      (filterUsage === '5to10' && promoCode.promo_expire >= 5 && promoCode.promo_expire <= 10) ||
      (filterUsage === '10to20' && promoCode.promo_expire > 10 && promoCode.promo_expire <= 20) ||
      (filterUsage === 'more20' && promoCode.promo_expire > 20);
  
    return matchesSearchTerm && matchesType && matchesValidity && matchesUsage;
  });
    
  const handleUpdate = (promoCode) => {
    navigate(`/admin-welcome/UpdatePromo/${promoCode._id}`);
  };

  const sendReportByEmail = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      // Generate PDF
      const doc = new jsPDF();
      doc.text('Promo Code Report', 14, 20);
      doc.autoTable({
      startY: 30,
      head: [['Promo Code', 'Type', 'Value', 'Start Date', 'End Date', 'Remaining Validity']],
      body: filteredPromo.map(promoCode => [
        promoCode.promo_code,
        promoCode.promo_type,
        promoCode.promo_value,
        moment(promoCode.promo_startDate).format('YYYY-MM-DD'),
        moment(promoCode.promo_endDate).format('YYYY-MM-DD'),
        `${calculateRemainingDays(promoCode.promo_endDate)} days`
      ]),
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const token = localStorage.getItem('token'); // Get token from local storage
    const response = await axios.post('http://localhost:5000/sendReport/sendReportEmail', {
      email: email,
      pdfBase64: pdfBase64
    }, {
      headers: { Authorization: `Bearer ${token}` }, // Set authorization header
    });
      
      if (response.data.success) {
        setShowReportSuccessPopup(true); // Show report success popup
        setTimeout(() => setShowReportSuccessPopup(false), 3000); // Hide after 3 seconds
        setShowEmailInput(false);
        setEmail('');
      } else {
        alert('Failed to send report: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error sending report:', error);
      alert('An error occurred while sending the report');
    }
  };

  const handleDelete = (promoId) => {
    setPromoToDelete(promoId); // Set the promo ID to delete
    setShowConfirm(true); // Show confirmation popup
  };

  const confirmDelete = async () => {
    try {
      await deletePromo(promoToDelete, 
        () => {
          // On success
          setShowSuccessPopup(true); // Show success popup
          setTimeout(() => setShowSuccessPopup(false), 3000); // Hide after 3 seconds
          // Remove the deleted promo from the state
          setPromo(promo.filter(p => p._id !== promoToDelete));
          setShowConfirm(false); // Hide confirmation popup
        },
        (error) => {
          // On error
          alert("Error deleting promo code: " + error.message);
        }
      );
    } catch (error) {
      console.error("Error in confirmDelete:", error);
    }
  };

  const downloadPDFReport = () => {
    const doc = new jsPDF();

    doc.text('Promo Code Report', 14, 20);
    doc.autoTable({
      startY: 30,
      head: [['Promo Code', 'Type', 'Value', 'Start Date', 'End Date', 'Remaining Validity']],
      body: filteredPromo.map(promoCode => [
        promoCode.promo_code,
        promoCode.promo_type,
        promoCode.promo_value,
        moment(promoCode.promo_startDate).format('YYYY-MM-DD'),
        moment(promoCode.promo_endDate).format('YYYY-MM-DD'),
        `${calculateRemainingDays(promoCode.promo_endDate)} days`
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });

    doc.save('promo_report.pdf');
  };

  const downloadChartAsPDF = (chartRef, filename, title) => {
    const chart = chartRef.current;
    if (!chart) {
      console.error('Chart reference is not available');
      return;
    }

    const canvas = chart.canvas;
    if (!canvas) {
      console.error('Canvas is not available');
      return;
    }

    // Create a new jsPDF instance (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 105, 15, { align: 'center' });

    // Get the aspect ratio of the chart
    const aspectRatio = canvas.width / canvas.height;

    // Set the width of the chart in the PDF (leaving margins)
    const pdfWidth = (pdf.internal.pageSize.getWidth() - 40) * 0.8; // 20mm margins on each side
    const pdfHeight = pdfWidth / aspectRatio;

    // Calculate the x-position to center the chart
    const xPosition = (pdf.internal.pageSize.getWidth() - pdfWidth) / 2;
    const yPosition = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2 + 10;

    // Add the chart image to the PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', xPosition, yPosition, pdfWidth, pdfHeight);

    // Save the PDF
    pdf.save(`${filename}.pdf`);
  };

  const pieChartData = {
    labels: ['Percentage', 'Fixed'],
    datasets: [{
      label: 'Promo Code Types',
      data: [
        promo.filter(p => p.promo_type === 'Percentage').length,
        promo.filter(p => p.promo_type === 'Fixed').length,
      ],
      backgroundColor: ['#36A2EB', '#FF6384'],
      hoverOffset: 4,
    }],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    }
  };

  // Data for Histogram (Bar Chart)
  const barChartData = {
    labels: promo.map(p => p.promo_code),
    datasets: [{
      label: 'Remaining Validity (Days)',
      data: promo.map(p => calculateRemainingDays(p.promo_endDate)),
      backgroundColor: '#4BC0C0',
    }],
  };

  return (
    <div className="promo-details-page">
      <div className="promo-details-layout">
        <nav className="promo-details-side-nav">
          <div className="nav-header">
            <h3>Navigation</h3>
          </div>
          <ul>
            <li>
              <Link to="/admin-welcome/AddPromo">
                <i className="fas fa-plus-circle"></i>
                <span>Add Promo</span>
              </Link>
            </li>
            <li>
              <Link to="/admin-welcome/PromoDetails" className="active">
                <i className="fas fa-list"></i>
                <span>Promo Details</span>
              </Link>
            </li>
            <li>
              <Link to="/admin-welcome/ExpiredPromo">
                <i className="fas fa-clock"></i>
                <span>Expired Promos</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="promo-details-container">
      
      <h1>Promo Details</h1>

      <div className="chart-containers">
        <div className="chart">
          <div className="chart-header">
            <h3>Promo Code Distribution by Type</h3>
          </div>
          <button className="download-chart-btn" onClick={() => downloadChartAsPDF(pieChartRef, 'promo_distribution', 'Promo Code Distribution by Type')}>
            <FaDownload />
          </button>
          <div className="pieChart">
            <Pie data={pieChartData} options={pieChartOptions} ref={pieChartRef} />
          </div>
        </div>

        <div className="charts">
          <div className="chart-headers">
            <h3>Promo Code Validity Period</h3>
          </div>
          <button className="download-chart-btn" onClick={() => downloadChartAsPDF(barChartRef, 'promo_validity', 'Promo Code Validity Period')}>
            <FaDownload />
          </button>
          <div className="barChart">
            <Bar 
              data={barChartData} 
              options={{
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Promo Codes',
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Days',
                    },
                    beginAtZero: true,
                  },
                },
                maintainAspectRatio: false,
              }} 
              ref={barChartRef}
            />
          </div>
        </div>
      </div>

      <div className="Lasitha-search-bar">
  <input 
    type="text" 
    placeholder="Search for a promo code" 
    className="Lasitha-search"
    value={searchTerm} 
    onChange={handleSearch} 
  />
  <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
    <i className="fa fa-filter"></i> Filter
  </button>
</div>

{showFilters && (
  <div className="filters">
    <div className="filter-group">
      <label htmlFor="type-filter">Type:</label>
      <select id="type-filter" value={filterType} onChange={handleFilterTypeChange}>
        <option value="">All</option>
        <option value="Percentage">Percentage</option>
        <option value="Fixed">Fixed</option>
      </select>
    </div>
    
    <div className="filter-group">
      <label htmlFor="validity-filter">Validity Period:</label>
      <select id="validity-filter" value={filterValidity} onChange={handleFilterValidityChange}>
        <option value="">All</option>
        <option value="less10">Less than 10 days</option>
        <option value="10to20">10 - 20 days</option>
        <option value="20to30">20 - 30 days</option>
        <option value="more30">More than 30 days</option>
      </select>
    </div>

    <div className="filter-group">
      <label htmlFor="usage-filter">Usage Limit:</label>
      <select id="usage-filter" value={filterUsage} onChange={handleFilterUsageChange}>
        <option value="">All</option>
        <option value="less5">Less than 5 uses</option>
        <option value="5to10">5 - 10 uses</option>
        <option value="10to20">10 - 20 uses</option>
        <option value="more20">More than 20 uses</option>
      </select>
    </div>
  </div>
)}

<div className="promo-grid-container">
      <div className="promo-grid">
        {filteredPromo.map((promoCode, index) => {
        const remainingDays = calculateRemainingDays(promoCode.promo_endDate);
        return (
          <div key={index} className="promo-code">
          <h2>{promoCode.promo_code}</h2>
          <p>Type: {promoCode.promo_type}</p>
          <p>Value: {promoCode.promo_value}</p>
          <p>Start Date: {moment(promoCode.promo_startDate).format("YYYY-MM-DD")}</p>
          <p>End Date: {moment(promoCode.promo_endDate).format("YYYY-MM-DD")}</p>
          <p>Remaining Validity: {remainingDays} days</p>
          <p>Remaining Uses: {promoCode.promo_expire}</p>
            <div className="actions">
              <button className="update-btn" onClick={() => handleUpdate(promoCode)}>Update</button>
              <button className="delete-btn" onClick={() => handleDelete(promoCode._id)}>Delete</button>
            </div>
            </div>
            );
        })}
      </div>
      </div>
          <div className="bottom-actions">
          <button className="download-btn" onClick={downloadPDFReport}>
            <i className="fa fa-download"></i> Download Report
          </button>
          <button className="email-btn" onClick={() => setShowEmailInput(!showEmailInput)}>
            <i className="fa fa-envelope"></i> Email Report
          </button>
          {showEmailInput && (
            <div className="email-input-container">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={handleEmailChange}
              />
              <button onClick={sendReportByEmail}>Send</button>
            </div>
          )}
        </div>
        {/* Confirmation Popup for Deletion */}
        {showConfirm && (
            <div className="popup-overlay">
              <div className="confirm-container">
                <div className="confirm-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>Are you sure you want to delete this promo code?</span>
                </div>
                <div className="confirm-buttons">
                  <button className="btn-delete" onClick={confirmDelete}>Yes</button>
                  <button className="btn-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        {/* Success Popup for Deletion */}
        {showSuccessPopup && (
            <div className="popup-overlay">
              <div className="popup-container">
                <div className="popup-message">
                  <i className="fas fa-check-circle animated-tick"></i>
                  <span>Promo Code Deleted Successfully!</span>
                </div>
              </div>
            </div>
          )}
        {/* Success Popup for Report Sending */}
        {showReportSuccessPopup && (
            <div className="popup-overlay">
              <div className="popup-container">
                <div className="popup-message">
                  <i className="fas fa-check-circle animated-tick"></i>
                  <span>Report sent successfully!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}