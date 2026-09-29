/**
 * Google Cloud Billing Reconciliation Platform - MVP Application Logic
 * Scope: 1 Provider (Google Cloud), 1 Selected Project (project-alpha-prod)
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State Model
  const state = {
    activeRole: 'ops', // Default demo role: Operations Specialist ('ops' | 'cloud' | 'management' | 'support')
    activeScreen: 'dashboard', // Current screen ID ('dashboard' | 'analytics' | 'billing-review' | 'sync-logs')
    selectedMonth: 'aug-2026',
    selectedServiceFilter: 'all',
    
    // Billing Cycle Status Model
    reviewStatus: 'Submitted to Cloud Team', // Options: 'Under Operations Review', 'Submitted to Cloud Team', 'Approved', 'Rejected (Pending Verification)'
    reviewStatusDesc: 'The billing summary has been submitted by Operations Specialist and is currently pending verification by the Cloud Team.',
    opsNotes: 'August 2026 billing dataset ingested via Apigee. Compute Engine usage matches expected baseline. Ready for verification.',
    submittedTimestamp: '2026-08-02 09:30 UTC',
    
    // Audit History Trail
    auditTrail: [
      { time: '2026-08-01 02:00 UTC', text: 'Automated monthly ingestion job SYNC-2026-08-01 completed via Apigee API connector (1,420 records).' },
      { time: '2026-08-02 09:30 UTC', text: 'Operations Specialist reviewed usage & cost summary and submitted to Cloud Team for verification.' }
    ],

    // Mock Historical Data for project-alpha-prod
    historicalData: {
      'aug-2026': [
        { service: 'Compute Engine', sku: 'N2 Virtual Machine Instance (me-central2)', metric: 'vCPU-Hours', qty: '48,200 Hrs', prevCost: 61500.00, currCost: 64282.50, variance: '+4.5%' },
        { service: 'BigQuery Analytics', sku: 'On-Demand Analysis & Slot Commitment', metric: 'TB Scanned', qty: '185 TB', prevCost: 38200.00, currCost: 39998.00, variance: '+4.7%' },
        { service: 'Cloud Storage', sku: 'Standard Storage & Archive (Dammam)', metric: 'GiB-Months', qty: '12,500 GiB', prevCost: 21800.00, currCost: 21427.50, variance: '-1.7%' },
        { service: 'Cloud Networking', sku: 'Egress Premium Tier & Cloud NAT', metric: 'GiB Egress', qty: '34,100 GiB', prevCost: 16650.00, currCost: 17142.00, variance: '+2.95%' }
      ],
      'jul-2026': [
        { service: 'Compute Engine', sku: 'N2 Virtual Machine Instance (me-central2)', metric: 'vCPU-Hours', qty: '46,100 Hrs', prevCost: 60100.00, currCost: 61500.00, variance: '+2.3%' },
        { service: 'BigQuery Analytics', sku: 'On-Demand Analysis & Slot Commitment', metric: 'TB Scanned', qty: '178 TB', prevCost: 37500.00, currCost: 38200.00, variance: '+1.8%' },
        { service: 'Cloud Storage', sku: 'Standard Storage & Archive (Dammam)', metric: 'GiB-Months', qty: '12,800 GiB', prevCost: 22000.00, currCost: 21800.00, variance: '-0.9%' },
        { service: 'Cloud Networking', sku: 'Egress Premium Tier & Cloud NAT', metric: 'GiB Egress', qty: '33,000 GiB', prevCost: 16200.00, currCost: 16650.00, variance: '+2.7%' }
      ],
      'jun-2026': [
        { service: 'Compute Engine', sku: 'N2 Virtual Machine Instance (me-central2)', metric: 'vCPU-Hours', qty: '45,000 Hrs', prevCost: 59000.00, currCost: 60100.00, variance: '+1.8%' },
        { service: 'BigQuery Analytics', sku: 'On-Demand Analysis & Slot Commitment', metric: 'TB Scanned', qty: '172 TB', prevCost: 36800.00, currCost: 37500.00, variance: '+1.9%' },
        { service: 'Cloud Storage', sku: 'Standard Storage & Archive (Dammam)', metric: 'GiB-Months', qty: '12,900 GiB', prevCost: 22100.00, currCost: 22000.00, variance: '-0.4%' },
        { service: 'Cloud Networking', sku: 'Egress Premium Tier & Cloud NAT', metric: 'GiB Egress', qty: '32,400 GiB', prevCost: 15900.00, currCost: 16200.00, variance: '+1.8%' }
      ],
      'may-2026': [
        { service: 'Compute Engine', sku: 'N2 Virtual Machine Instance (me-central2)', metric: 'vCPU-Hours', qty: '44,200 Hrs', prevCost: 58200.00, currCost: 59000.00, variance: '+1.4%' },
        { service: 'BigQuery Analytics', sku: 'On-Demand Analysis & Slot Commitment', metric: 'TB Scanned', qty: '168 TB', prevCost: 36000.00, currCost: 36800.00, variance: '+2.2%' },
        { service: 'Cloud Storage', sku: 'Standard Storage & Archive (Dammam)', metric: 'GiB-Months', qty: '13,000 GiB', prevCost: 22200.00, currCost: 22100.00, variance: '-0.5%' },
        { service: 'Cloud Networking', sku: 'Egress Premium Tier & Cloud NAT', metric: 'GiB Egress', qty: '31,800 GiB', prevCost: 15600.00, currCost: 15900.00, variance: '+1.9%' }
      ],
      'apr-2026': [
        { service: 'Compute Engine', sku: 'N2 Virtual Machine Instance (me-central2)', metric: 'vCPU-Hours', qty: '43,500 Hrs', prevCost: 57500.00, currCost: 58200.00, variance: '+1.2%' },
        { service: 'BigQuery Analytics', sku: 'On-Demand Analysis & Slot Commitment', metric: 'TB Scanned', qty: '162 TB', prevCost: 35200.00, currCost: 36000.00, variance: '+2.3%' },
        { service: 'Cloud Storage', sku: 'Standard Storage & Archive (Dammam)', metric: 'GiB-Months', qty: '13,100 GiB', prevCost: 22300.00, currCost: 22200.00, variance: '-0.4%' },
        { service: 'Cloud Networking', sku: 'Egress Premium Tier & Cloud NAT', metric: 'GiB Egress', qty: '31,200 GiB', prevCost: 15200.00, currCost: 15600.00, variance: '+2.6%' }
      ]
    },

    // Sync Execution History Log (Support Team)
    syncLogs: [
      { id: 'SYNC-2026-08-01', time: '2026-08-01 02:00:14 UTC', trigger: 'Cloud Scheduler (Monthly)', records: 1420, duration: '42.3s', status: 'SUCCESS', details: 'Ingestion completed successfully via Apigee Base Proxy. Normalized records stored in Cloud SQL & BigQuery.' },
      { id: 'SYNC-2026-07-01', time: '2026-07-01 02:00:11 UTC', trigger: 'Cloud Scheduler (Monthly)', records: 1385, duration: '39.8s', status: 'SUCCESS', details: 'Ingestion completed successfully via Apigee Base Proxy. Normalized records stored in Cloud SQL & BigQuery.' },
      { id: 'SYNC-2026-06-15', time: '2026-06-15 14:12:05 UTC', trigger: 'Support Manual Retry', records: 1340, duration: '41.1s', status: 'SUCCESS', details: 'Manual retry executed by Support Admin following API quota recovery.' },
      { id: 'SYNC-2026-06-01', time: '2026-06-01 02:00:08 UTC', trigger: 'Cloud Scheduler (Monthly)', records: 0, duration: '12.4s', status: 'FAILED', details: 'API Rate Limit / Quota Exceeded on Cloud Billing API via Apigee. Automated retry scheduled.' }
    ],

    // RBAC Security Permissions Definition Matrix
    rbacMatrix: {
      ops: {
        name: 'Operations Specialist',
        desc: 'Tracks usage, checks summary & submits to Cloud Team',
        allowedScreens: ['dashboard', 'analytics', 'billing-review']
      },
      cloud: {
        name: 'Cloud Team',
        desc: 'Verifies usage details & tracks external approval status',
        allowedScreens: ['dashboard', 'analytics', 'billing-review']
      },
      management: {
        name: 'Company Management',
        desc: 'Executive access to high-level spend & usage dashboard',
        allowedScreens: ['dashboard']
      },
      support: {
        name: 'Support Team',
        desc: 'Responsible for synchronization, validation & retry logs',
        allowedScreens: ['sync-logs']
      }
    }
  };

  // DOM Elements Initialization
  const roleSwitcher = document.getElementById('role-switcher');
  const activeRoleDisplay = document.getElementById('active-role-display');
  const activeRoleDesc = document.getElementById('active-role-desc');
  const toggleSidebarBtn = document.getElementById('toggle-sidebar');
  const sidebar = document.getElementById('gcp-sidebar');
  const navItems = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.app-screen');
  const restrictedNotice = document.getElementById('restricted-notice');
  const permittedRolesList = document.getElementById('permitted-roles-list');

  // App Initialization Sequence
  function init() {
    setupEventListeners();
    
    // Check initial location hash or default to dashboard
    const hash = window.location.hash.replace('#', '');
    const initialScreen = ['dashboard', 'analytics', 'billing-review', 'sync-logs'].includes(hash) ? hash : 'dashboard';
    
    state.activeScreen = initialScreen;
    applyRolePermissions(state.activeRole);

    // Window resize handler for chart responsive redrawing
    window.addEventListener('resize', () => {
      if (state.activeScreen === 'dashboard') {
        renderDashboardTrendChart();
      }
    });
  }

  function setupEventListeners() {
    // 1. Prototype Demo Role Switcher Listener
    roleSwitcher.addEventListener('change', (e) => {
      state.activeRole = e.target.value;
      applyRolePermissions(state.activeRole);
    });

    // 2. Sidebar Drawer Toggle Listener
    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      setTimeout(() => {
        if (state.activeScreen === 'dashboard') {
          renderDashboardTrendChart();
        }
      }, 300);
    });

    // 3. Sidebar SPA Navigation Listeners (All items clickable for RBAC testing)
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetScreen = item.getAttribute('data-screen');
        if (targetScreen) {
          window.location.hash = targetScreen;
          navigateToScreen(targetScreen);
        }
      });
    });

    // 4. Hashchange Listener for browser history navigation
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'analytics', 'billing-review', 'sync-logs'].includes(hash)) {
        navigateToScreen(hash);
      }
    });

    // 5. Filter Listeners on Historical Billing Data Screen
    document.getElementById('month-select')?.addEventListener('change', (e) => {
      state.selectedMonth = e.target.value;
      const monthTextMap = {
        'aug-2026': 'August 2026',
        'jul-2026': 'July 2026',
        'jun-2026': 'June 2026',
        'may-2026': 'May 2026',
        'apr-2026': 'April 2026'
      };
      const titleEl = document.getElementById('table-month-title');
      if (titleEl) titleEl.textContent = monthTextMap[e.target.value] || 'Selected Month';
      renderHistoricalTable();
    });

    document.getElementById('service-filter')?.addEventListener('change', (e) => {
      state.selectedServiceFilter = e.target.value;
      renderHistoricalTable();
    });

    // 6. Operations Specialist Review Submission Button
    document.getElementById('btn-submit-to-cloud')?.addEventListener('click', () => {
      const notesEl = document.getElementById('ops-notes-input');
      const notes = notesEl ? notesEl.value.trim() : '';
      state.opsNotes = notes || 'Usage & billing summary verified by Operations Specialist.';
      state.reviewStatus = 'Submitted to Cloud Team';
      state.reviewStatusDesc = 'The billing summary has been submitted by Operations Specialist and is currently pending verification by the Cloud Team.';
      
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      state.submittedTimestamp = nowStr;
      state.auditTrail.unshift({
        time: nowStr,
        text: `Operations Specialist reviewed summary and submitted to Cloud Team for verification.`
      });

      const msgEl = document.getElementById('ops-submission-msg');
      const timeEl = document.getElementById('submit-timestamp');
      if (msgEl) msgEl.classList.remove('hidden');
      if (timeEl) timeEl.textContent = nowStr;
      
      renderReviewScreen();
      renderDashboardStatus();
    });

    // 7. Prototype Status Simulator Buttons (Simulate External Business Outcome)
    document.getElementById('sim-set-approved')?.addEventListener('click', () => {
      state.reviewStatus = 'Approved';
      state.reviewStatusDesc = 'Verification completed and approved through external business process. Cycle closed.';
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      state.auditTrail.unshift({
        time: nowStr,
        text: 'External Business Process Outcome: Billing report Approved by Cloud Team.'
      });
      renderReviewScreen();
      renderDashboardStatus();
    });

    document.getElementById('sim-set-rejected')?.addEventListener('click', () => {
      state.reviewStatus = 'Rejected (Pending Verification)';
      state.reviewStatusDesc = 'Flagged for discrepancy during external review. Team checking with client/vendor to verify usage variance.';
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      state.auditTrail.unshift({
        time: nowStr,
        text: 'External Business Process Outcome: Billing report Rejected. Client/Vendor verification initiated.'
      });
      renderReviewScreen();
      renderDashboardStatus();
    });

    document.getElementById('sim-set-pending')?.addEventListener('click', () => {
      state.reviewStatus = 'Submitted to Cloud Team';
      state.reviewStatusDesc = 'The billing summary has been submitted by Operations Specialist and is currently pending verification by the Cloud Team.';
      renderReviewScreen();
      renderDashboardStatus();
    });

    // 8. Support Team Trigger Manual Retry Button
    document.getElementById('btn-trigger-retry')?.addEventListener('click', () => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      const newSyncId = 'SYNC-' + Math.floor(100000 + Math.random() * 900000);
      state.syncLogs.unshift({
        id: newSyncId,
        time: nowStr,
        trigger: 'Support Manual Retry',
        records: 1420,
        duration: '38.4s',
        status: 'SUCCESS',
        details: 'Manual retry successfully triggered by Support Admin. Data re-ingested via Apigee Base Proxy.'
      });
      renderSyncLogs();
      alert(`Manual synchronization triggered! (${newSyncId} completed successfully).`);
    });

    document.getElementById('close-diag-btn')?.addEventListener('click', () => {
      const drawer = document.getElementById('diagnostic-drawer');
      if (drawer) drawer.classList.add('hidden');
    });
  }

  // Apply Role Permissions & Visual Indicators
  function applyRolePermissions(roleKey) {
    const roleConfig = state.rbacMatrix[roleKey];
    if (!roleConfig) return;

    // Update active persona indicator card in sidebar
    if (activeRoleDisplay) activeRoleDisplay.textContent = roleConfig.name;
    if (activeRoleDesc) activeRoleDesc.textContent = roleConfig.desc;

    // Update Sidebar Navigation Link Styling & Indicators
    navItems.forEach(item => {
      const screenKey = item.getAttribute('data-screen');
      const isAllowed = roleConfig.allowedScreens.includes(screenKey);

      // Keep pointerEvents = 'auto' so ALL items can be clicked to test RBAC guards
      item.style.pointerEvents = 'auto';

      if (isAllowed) {
        item.style.opacity = '1';
        item.title = `Access Granted (${roleConfig.name})`;
      } else {
        item.style.opacity = '0.55';
        item.title = `Restricted for ${roleConfig.name} - Click to test security guard`;
      }
    });

    // Operations Action Area (Editable for Ops, Read-only for Cloud Team/others)
    const opsActionArea = document.getElementById('ops-action-area');
    if (opsActionArea) {
      if (roleKey === 'ops') {
        opsActionArea.style.pointerEvents = 'auto';
        opsActionArea.style.opacity = '1';
      } else {
        opsActionArea.style.pointerEvents = 'none';
        opsActionArea.style.opacity = '0.65';
      }
    }

    // Auto-navigate to first allowed screen if currently on a restricted screen
    if (!roleConfig.allowedScreens.includes(state.activeScreen)) {
      navigateToScreen(roleConfig.allowedScreens[0]);
    } else {
      navigateToScreen(state.activeScreen);
    }
  }

  // Primary Navigation & Screen Controller
  function navigateToScreen(screenId) {
    state.activeScreen = screenId;
    const roleConfig = state.rbacMatrix[state.activeRole];
    const allowed = roleConfig ? roleConfig.allowedScreens.includes(screenId) : false;

    // Update active navigation item highlight
    navItems.forEach(item => {
      if (item.getAttribute('data-screen') === screenId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Hide all screens initially
    screens.forEach(screen => screen.classList.add('hidden'));

    if (allowed) {
      // Hide Restricted Notice
      if (restrictedNotice) restrictedNotice.classList.add('hidden');
      
      // Un-hide target screen
      const targetEl = document.getElementById(`screen-${screenId}`);
      if (targetEl) targetEl.classList.remove('hidden');

      // Trigger screen-specific renderers
      if (screenId === 'dashboard') {
        // Use requestAnimationFrame to ensure canvas width is measured after display un-hide
        requestAnimationFrame(() => {
          renderDashboardTrendChart();
        });
      } else if (screenId === 'analytics') {
        renderHistoricalTable();
      } else if (screenId === 'billing-review') {
        renderReviewScreen();
      } else if (screenId === 'sync-logs') {
        renderSyncLogs();
      }
    } else {
      // Show Access Restricted Guard Notice
      if (restrictedNotice) restrictedNotice.classList.remove('hidden');

      // Populate list of permitted roles for user feedback
      const permittedNames = Object.keys(state.rbacMatrix)
        .filter(r => state.rbacMatrix[r].allowedScreens.includes(screenId))
        .map(r => state.rbacMatrix[r].name);
      
      if (permittedRolesList) {
        permittedRolesList.textContent = permittedNames.join(', ');
      }
    }
  }

  // 12-Month Account Spend Trend Chart Canvas Renderer
  function renderDashboardTrendChart() {
    const canvas = document.getElementById('trendChartCanvas');
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Measure parent container width
    const rect = parent.getBoundingClientRect();
    const width = Math.max(rect.width || 600, 300);
    const height = 240;

    // Support High-DPI Display Scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Chart Data Model (Monthly Spend in SAR Thousands)
    const months = ['Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26'];
    const spendData = [118.0, 122.5, 120.2, 125.0, 128.4, 130.1, 132.5, 135.0, 136.2, 137.5, 138.15, 142.85];

    const paddingLeft = 55;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const minVal = 100;
    const maxVal = 160;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Y-Axis Grid Lines & Labels
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748B';
    ctx.font = '11px "Roboto", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const ySteps = [100, 120, 140, 160];
    ySteps.forEach(stepVal => {
      const y = paddingTop + chartHeight - ((stepVal - minVal) / (maxVal - minVal)) * chartHeight;
      
      // Grid line
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Label
      ctx.fillText(`${stepVal}k SAR`, paddingLeft - 8, y);
    });

    // Calculate Data Points
    const points = spendData.map((val, index) => {
      const x = paddingLeft + (chartWidth / (spendData.length - 1)) * index;
      const y = paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, val, label: months[index] };
    });

    // 2. Draw Gradient Fill Under Curve (SBM Royal Blue)
    const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
    gradient.addColorStop(0, 'rgba(0, 130, 200, 0.22)');
    gradient.addColorStop(1, 'rgba(0, 130, 200, 0.01)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
    ctx.lineTo(points[0].x, height - paddingBottom);
    ctx.closePath();
    ctx.fill();

    // 3. Draw Trend Line (SBM Royal Blue)
    ctx.strokeStyle = '#0082C8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((p, index) => {
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // 4. Draw Data Points & X-Axis Month Labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    points.forEach((p, index) => {
      // Draw Circle Dot
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#0082C8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw X-Axis Label
      ctx.fillStyle = '#64748B';
      ctx.font = '10px "Roboto", sans-serif';
      ctx.fillText(p.label, p.x, height - paddingBottom + 10);
    });

    // 5. Highlight Latest Month Callout (Aug 26)
    const lastPoint = points[points.length - 1];
    ctx.fillStyle = '#005F94';
    ctx.font = 'bold 11px "Google Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SAR 142.85K`, lastPoint.x - 10, lastPoint.y - 16);
  }

  // Historical Billing Data Table Renderer
  function renderHistoricalTable() {
    const tbody = document.querySelector('#historical-data-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const data = state.historicalData[state.selectedMonth] || state.historicalData['aug-2026'];
    const filter = state.selectedServiceFilter;

    data.forEach(row => {
      if (filter !== 'all') {
        const matchMap = {
          compute: 'Compute Engine',
          bigquery: 'BigQuery Analytics',
          storage: 'Cloud Storage',
          network: 'Cloud Networking'
        };
        if (row.service !== matchMap[filter]) return;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${row.service}</strong></td>
        <td><code>${row.sku}</code></td>
        <td>${row.metric}</td>
        <td><strong>${row.qty}</strong></td>
        <td>SAR ${row.prevCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td><strong>SAR ${row.currCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
        <td><span class="status-badge ${row.variance.startsWith('+') ? 'status-pending' : 'status-approved'}">${row.variance}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Review & Status Screen Renderer
  function renderReviewScreen() {
    const mainStatusBadge = document.getElementById('main-review-status-badge');
    const mainStatusDesc = document.getElementById('main-review-status-desc');
    const timelineList = document.getElementById('audit-timeline-list');
    const stepOpsNode = document.getElementById('step-node-ops');
    const stepCloudNode = document.getElementById('step-node-cloud');
    const stepConnCloud = document.getElementById('step-conn-cloud');

    if (!mainStatusBadge) return;

    mainStatusBadge.textContent = state.reviewStatus;
    mainStatusDesc.textContent = state.reviewStatusDesc;

    if (state.reviewStatus === 'Approved') {
      mainStatusBadge.className = 'status-badge-large status-approved';
      if (stepOpsNode) stepOpsNode.className = 'step-item completed';
      if (stepCloudNode) stepCloudNode.className = 'step-item completed';
      if (stepConnCloud) stepConnCloud.className = 'step-connector completed';
    } else if (state.reviewStatus.includes('Rejected')) {
      mainStatusBadge.className = 'status-badge-large status-rejected';
      if (stepOpsNode) stepOpsNode.className = 'step-item completed';
      if (stepCloudNode) stepCloudNode.className = 'step-item active';
      if (stepConnCloud) stepConnCloud.className = 'step-connector';
    } else {
      mainStatusBadge.className = 'status-badge-large status-pending';
      if (stepOpsNode) stepOpsNode.className = 'step-item completed';
      if (stepCloudNode) stepCloudNode.className = 'step-item active';
      if (stepConnCloud) stepConnCloud.className = 'step-connector';
    }

    // Render Audit Timeline List
    if (timelineList) {
      timelineList.innerHTML = '';
      state.auditTrail.forEach(item => {
        const li = document.createElement('li');
        li.className = 'audit-item';
        li.innerHTML = `
          <div class="audit-time">${item.time}</div>
          <div class="audit-text">${item.text}</div>
        `;
        timelineList.appendChild(li);
      });
    }
  }

  // Dashboard KPI Status Renderer
  function renderDashboardStatus() {
    const dashBadge = document.getElementById('dash-status-badge');
    const dashSubtext = document.getElementById('dash-status-subtext');
    if (!dashBadge) return;

    dashBadge.textContent = state.reviewStatus;
    if (dashSubtext) dashSubtext.textContent = state.reviewStatusDesc;

    if (state.reviewStatus === 'Approved') {
      dashBadge.className = 'status-badge status-approved';
    } else if (state.reviewStatus.includes('Rejected')) {
      dashBadge.className = 'status-badge status-rejected';
    } else {
      dashBadge.className = 'status-badge status-pending';
    }
  }

  // Synchronization Logs Renderer (Support Team)
  function renderSyncLogs() {
    const tbody = document.querySelector('#sync-logs-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    state.syncLogs.forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code class="text-primary">${log.id}</code></td>
        <td>${log.time}</td>
        <td>${log.trigger}</td>
        <td><strong>${log.records.toLocaleString()} records</strong></td>
        <td>${log.duration}</td>
        <td><span class="status-badge ${log.status === 'SUCCESS' ? 'status-approved' : 'status-rejected'}">${log.status}</span></td>
        <td>
          <button class="gcp-btn gcp-btn-secondary view-diag-btn" data-id="${log.id}">
            <span class="material-symbols-outlined">notes</span> View Logs
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Log Detail Inspection Button Listeners
    document.querySelectorAll('.view-diag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const log = state.syncLogs.find(l => l.id === id);
        if (log) {
          const diagId = document.getElementById('diag-log-id');
          const diagContent = document.getElementById('log-stacktrace-content');
          const drawer = document.getElementById('diagnostic-drawer');

          if (diagId) diagId.textContent = log.id;
          if (diagContent) {
            diagContent.textContent = 
              `[TIMESTAMP]: ${log.time}\n` +
              `[SYNC ID]: ${log.id}\n` +
              `[TRIGGER]: ${log.trigger}\n` +
              `[TARGET SCOPE]: Provider: Google Cloud | Project: project-alpha-prod\n` +
              `[CONNECTOR]: Apigee Base Proxy (Read-Only IAM Service Account)\n` +
              `[STATUS]: ${log.status}\n` +
              `[INGESTED RECORDS]: ${log.records}\n` +
              `[DETAILS]: ${log.details}\n\n` +
              `--- END OF DIAGNOSTIC LOG ---`;
          }
          if (drawer) drawer.classList.remove('hidden');
        }
      });
    });
  }

  // Execute Init
  init();
});
