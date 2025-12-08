import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { UtilsService } from '../../../services/utils.service';
import { firstValueFrom } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-alimentacion',
  templateUrl: './alimentacion.page.html',
  styleUrls: ['./alimentacion.page.scss'],
  standalone: false,
})
export class AlimentacionPage implements OnInit {

  busqueda: string = '';
  resultadosAPI: any[] = [];

  form = new FormGroup({
    alimento: new FormControl('', [Validators.required]),
    cantidad: new FormControl('', [Validators.required]),
    categoria: new FormControl('Desayuno', [Validators.required]),
    calorias: new FormControl(''),
    fecha: new FormControl('', [Validators.required])
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  alertCtrl = inject(AlertController);
  http = inject(HttpClient);

  mostrarFormulario = false;
  mostrarHistorial = false;
  registros: any[] = [];

  registroEditandoId: string | null = null;

  totalCaloriasDia = 0;
  totalGramosDia = 0;
  totalComidasDia = 0;
  ultimaComida = '—';

  weeklyData: { date: string, calories: number, grams: number }[] = [];
  weeklyCaloriesTotal: number = 0;
  weeklyCaloriesAvg: number = 0;

  grafico: Chart | null = null;

  caloriesApiUrl = 'https://api.calorieninjas.com/v1/nutrition?query=';
  caloriesApiKey = '3qrYUM1nPjedZMvSSwErOg==rJXHdmOEffvti6Xs';

  ngOnInit() {
    this.loadRegistros();
  }

  // 🔥 Obtener bebé activo desde localStorage
  getCurrentBaby() {
    return JSON.parse(localStorage.getItem('currentBaby') || 'null');
  }

  toggleHistorial() {
    this.mostrarHistorial = !this.mostrarHistorial;
  }

  abrirFormulario(registro?: any) {
    this.mostrarFormulario = true;
    this.resultadosAPI = [];

    if (registro) {
      this.form.patchValue({
        alimento: registro.alimento,
        cantidad: registro.cantidad,
        categoria: registro.categoria,
        calorias: registro.calorias != null ? String(registro.calorias) : '',
        fecha: registro.fecha
      });
      this.registroEditandoId = registro.id;

    } else {
      this.form.patchValue({
        categoria: 'Desayuno',
        calorias: '',
        fecha: new Date().toISOString()
      });
      this.registroEditandoId = null;
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.form.reset();
    this.registroEditandoId = null;
    this.resultadosAPI = [];
  }

  async buscarAlimento(event: any) {
    const query = event.target.value;
    if (!query || query.trim().length < 2) {
      this.resultadosAPI = [];
      return;
    }

    try {
      const headers = new HttpHeaders({ 'X-Api-Key': this.caloriesApiKey });
      const resp: any = await firstValueFrom(this.http.get(this.caloriesApiUrl + query, { headers }));

      if (Array.isArray(resp.items)) this.resultadosAPI = resp.items;
      else if (Array.isArray(resp)) this.resultadosAPI = resp;
      else if (Array.isArray(resp.foods)) this.resultadosAPI = resp.foods;
      else this.resultadosAPI = resp.items || [];

    } catch (e) {
      console.error(e);
      this.resultadosAPI = [];
    }
  }

  seleccionarAlimento(item: any) {
    const nombre = item.name ?? item.food_name ?? item.item_name ?? '';
    const calorias = item.calories ?? null;
    const serving = item.serving_size_g ?? 100;

    this.form.patchValue({
      alimento: nombre,
      calorias: calorias != null ? String(Math.round(Number(calorias))) : '',
      cantidad: serving
    });

    this.resultadosAPI = [];
  }

  async guardarRegistro() {
    if (!this.form.valid) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const baby = this.getCurrentBaby();
      if (!baby) throw new Error('No hay un bebé activo seleccionado.');

      const path = `users/${user.uid}/babies/${baby.id}/alimentacion`;

      const payload = {
        alimento: this.form.value.alimento,
        cantidad: Number(this.form.value.cantidad),
        categoria: this.form.value.categoria,
        calorias: this.form.value.calorias !== '' ? Number(this.form.value.calorias) : null,
        fecha: this.form.value.fecha
      };

      if (this.registroEditandoId) {
        await this.firebaseSvc.updateDocument(`${path}/${this.registroEditandoId}`, payload);
      } else {
        await this.firebaseSvc.addDocument(path, payload);
      }

      await this.loadRegistros();
      this.cerrarFormulario();

    } catch (error: any) {
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'danger'
      });
    } finally {
      loading.dismiss();
    }
  }

  async eliminarRegistro(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Eliminar registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const baby = this.getCurrentBaby();

            const path = `users/${user.uid}/babies/${baby.id}/alimentacion/${id}`;
            await this.firebaseSvc.deleteDocument(path);

            this.loadRegistros();
          }
        }
      ]
    });

    await alert.present();
  }

  async loadRegistros() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const baby = this.getCurrentBaby();
      if (!baby) {
        this.registros = [];
        return;
      }

      const path = `users/${user.uid}/babies/${baby.id}/alimentacion`;

      const data: any = await firstValueFrom(this.firebaseSvc.getCollectionData(path));

      this.registros = (data || []).map((r: any) => ({
        id: r.id,
        alimento: r.alimento || '',
        cantidad: Number(r.cantidad) || 0,
        categoria: r.categoria || 'Sin categoría',
        calorias: r.calorias != null ? Number(r.calorias) : null,
        fecha: r.fecha
      }));

      this.registros.sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

      this.procesarDashboardYSemana();
      if (!this.grafico) this.initChart();
      else this.updateChart();

    } catch (err) {
      console.error(err);
    }
  }

  procesarDashboardYSemana() {
    const hoy = new Date();
    const hoyKey = this._formatDate(hoy);

    this.totalCaloriasDia = 0;
    this.totalGramosDia = 0;
    this.totalComidasDia = 0;
    this.ultimaComida = '—';

    for (const r of this.registros) {
      const key = this._formatDate(new Date(r.fecha));
      if (key === hoyKey) {
        this.totalComidasDia++;
        this.totalGramosDia += r.cantidad;
        if (r.calorias != null) this.totalCaloriasDia += r.calorias;
      }
    }

    if (this.registros.length) {
      this.ultimaComida = this.registros[0].alimento;
    }

    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(hoy.getDate() - i);
      week.push({ dateObj: d, key: this._formatDate(d) });
    }

    this.weeklyData = week.map(w => {
      const recs = this.registros.filter(r => this._formatDate(new Date(r.fecha)) === w.key);
      return {
        date: w.dateObj.toISOString(),
        calories: recs.reduce((s, r) => s + (r.calorias || 0), 0),
        grams: recs.reduce((s, r) => s + r.cantidad, 0)
      };
    });

    this.weeklyCaloriesTotal = this.weeklyData.reduce((s, d) => s + d.calories, 0);
    this.weeklyCaloriesAvg = Math.round((this.weeklyCaloriesTotal / 7) * 100) / 100;
  }

  _formatDate(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  initChart() {
    const ctx: any = document.getElementById('graficoSemanal');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.weeklyData.map(d =>
          new Date(d.date).toLocaleDateString('es-CL', { weekday: 'short' })
        ),
        datasets: [
          {
            label: 'Calorías',
            data: this.weeklyData.map(d => d.calories),
            backgroundColor: '#d1789c'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    };

    this.grafico = new Chart(ctx, config);
  }

  updateChart() {
    if (!this.grafico) return;

    this.grafico.data.labels = this.weeklyData.map(d =>
      new Date(d.date).toLocaleDateString('es-CL', { weekday: 'short' })
    );

    this.grafico.data.datasets![0].data = this.weeklyData.map(d => d.calories);

    this.grafico.update();
  }

getDiaSemana(fechaStr: string): string {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[new Date(fechaStr).getDay()];
}

getHora(fechaStr: string): string {
  const f = new Date(fechaStr);
  return f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

filtrar(lista: any[]) {
  if (!this.busqueda.trim()) return lista;
  return lista.filter(i =>
    i.alimento.toLowerCase().includes(this.busqueda.toLowerCase())
  );
}

}
