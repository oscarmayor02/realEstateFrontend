import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  totalUsers: number = 0;
  totalProperties: number = 0;
  totalReservations: number = 0;
  approvedReservations: number = 0;
  approvalRate: number = 0;
  propertiesCountByUser: { [userId: number]: number } = {};
  earningsByUser: { [userId: number]: number } = {};
  users: any[] = [];
  recentReservations: any[] = [];
  dataLoaded: boolean = false;

  userChartData: ChartData<'line'> = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'User Registrations',
        data: [],
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13,110,253,0.3)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };
  userChartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true, mode: 'nearest' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  fullYearUserChartData: ChartData<'line'> = {
    labels: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    datasets: [
      {
        label: 'Usuarios registrados por mes',
        data: [],
        borderColor: '#0dcaf0',
        backgroundColor: 'rgba(13,202,240,0.3)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };
  fullYearUserChartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true, mode: 'nearest' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  // Aquí reasignamos todo el objeto para que Angular detecte el cambio y se redibuje
  propResChartData: ChartData<'bar'> = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'Properties Added',
        data: [],
        backgroundColor: '#198754',
        borderRadius: 5,
      },
      {
        label: 'Reservations',
        data: [],
        backgroundColor: '#ffc107',
        borderRadius: 5,
      },
    ],
  };
  propResChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  rolesChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#198754', '#ffc107', '#0d6efd'],
        hoverOffset: 30,
      },
    ],
  };
  rolesChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { enabled: true },
    },
  };

  feedbackChartData: ChartData<'radar'> = {
    labels: ['Cleanliness', 'Location', 'Value', 'Communication', 'Accuracy'],
    datasets: [
      {
        label: 'Avg. Ratings',
        data: [4.5, 4.2, 4.7, 4.8, 4.6],
        fill: true,
        backgroundColor: 'rgba(13,110,253,0.4)',
        borderColor: '#0d6efd',
        pointBackgroundColor: '#0d6efd',
      },
    ],
  };
  feedbackChartOptions: ChartOptions<'radar'> = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1 },
        pointLabels: { font: { size: 14 } },
      },
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
  };

  propertiesPerUserChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Properties Owned',
        data: [],
        backgroundColor: '#0d6efd',
        borderRadius: 5,
      },
    ],
  };
  propertiesPerUserChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  earningsPerUserChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Estimated Earnings (k$)',
        data: [],
        backgroundColor: '#198754',
        borderRadius: 5,
      },
    ],
  };
  earningsPerUserChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.cdr.detectChanges();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects === '/admin/dashboard') {
          this.loadDashboardData();
          this.cdr.detectChanges();
        }
      });
    this.cdr.detectChanges();
  }

  parseDate(date: number[] | string): Date {
    if (Array.isArray(date)) {
      const [year, month, day, hour = 0, minute = 0] = date;
      return new Date(year, month - 1, day, hour, minute);
    } else if (typeof date === 'string') {
      return new Date(date);
    }
    return new Date(NaN);
  }

  loadDashboardData() {
    this.dashboardService.getDashboardData().subscribe((data) => {
      console.log(data);
      this.cdr.detectChanges();

      this.totalUsers = data.totalUsers;
      this.totalProperties = data.totalProperties;
      this.totalReservations = data.totalReservations;
      this.approvedReservations = data.approvedReservations;
      this.approvalRate = data.approvalRate;
      this.propertiesCountByUser = data.propertiesCountByUser;
      this.earningsByUser = data.earningsByUser;
      this.users = data.users;
      this.cdr.detectChanges();

      this.recentReservations = data.reservations

        .filter(
          (r) =>
            r.status === 'CONFIRMED' &&
            (Array.isArray(r.startDate) || typeof r.startDate === 'string')
        )
        .map((r) => ({
          property: r.propertyTitle,
          user: r.clientName,
          date: this.parseDate(r.startDate),
        }))
        .filter((r) => !isNaN(r.date.getTime()))
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 4);
      this.cdr.detectChanges();

      this.userChartData.datasets[0].data = data.monthlyRegistrations;

      // Aquí reasignamos el objeto completo para que se actualice el gráfico:
      this.propResChartData = {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        datasets: [
          {
            label: 'Properties Added',
            data: data.monthlyProperties,
            backgroundColor: '#198754',
            borderRadius: 5,
          },
          {
            label: 'Reservations',
            data: data.monthlyReservations,
            backgroundColor: '#ffc107',
            borderRadius: 5,
          },
        ],
      };
      this.cdr.detectChanges();

      this.rolesChartData.labels = Object.keys(data.userRolesCount);
      this.rolesChartData.datasets[0].data = Object.values(data.userRolesCount);

      const userIds = Object.keys(data.propertiesCountByUser);
      const usersMap = new Map(data.users.map((u) => [u.id, u.name]));
      this.propertiesPerUserChartData.labels = userIds.map(
        (id) => usersMap.get(+id) ?? 'Unknown'
      );
      this.cdr.detectChanges();

      this.propertiesPerUserChartData.datasets[0].data = userIds.map(
        (id) => data.propertiesCountByUser[+id]
      );
      this.cdr.detectChanges();

      this.earningsPerUserChartData.labels = userIds.map(
        (id) => usersMap.get(+id) ?? 'Unknown'
      );
      this.cdr.detectChanges();

      this.earningsPerUserChartData.datasets[0].data = userIds.map(
        (id) => +(data.earningsByUser[+id] / 1000).toFixed(2)
      );
      this.cdr.detectChanges();

      this.fullYearUserChartData.datasets[0].data = Array(12)
        .fill(0)
        .map((_, i) => data.usersPerMonth?.[i] ?? 0);
      this.cdr.detectChanges();

      this.dataLoaded = true;
    });
  }
}
