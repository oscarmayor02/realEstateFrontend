import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Property } from '../../services/property';
import { PropertyState } from '../../services/property-state';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-filters',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './property-filters.html',
  styleUrl: './property-filters.css',
})
export class PropertyFilters {
  @Input() departamentos: any[] = [];
  @Input() ciudades: string[] = [];
  @Output() search = new EventEmitter<any>();
  @Output() ubicacionSeleccionada = new EventEmitter<string>();
  mostrarMasFiltros = false;
  precioMaximo = 5000000;
  selectedRooms: number | null = null;
  searchForm: FormGroup;
  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.searchForm = this.fb.group({
      departamento: [''],
      ciudad: [''],
      type: [''],
      minPrice: [null],
      maxPrice: [5000000], // valor inicial para el rango
      rooms: [null],
    });
  }

  onSearch() {
    const { departamento, ciudad, type, minPrice, maxPrice, rooms } =
      this.searchForm.value;
    const params: any = {};
    if (departamento) params.departamento = departamento;
    if (ciudad) params.ciudad = ciudad;
    if (type) params.type = type;
    if (minPrice !== null && minPrice !== undefined && minPrice !== '')
      params.minPrice = minPrice;
    if (maxPrice !== null && maxPrice !== undefined && maxPrice !== '')
      params.maxPrice = maxPrice;
    if (rooms !== null && rooms !== undefined && rooms !== '') {
      params.bedrooms = rooms;
    }

    this.search.emit(params);
    this.cdr.detectChanges();
  }

  actualizarPrecioMaximo() {
    this.searchForm.get('maxPrice')?.setValue(this.precioMaximo);
  }

  onDepartamentoChange(event: Event) {
    const depto = (event.target as HTMLSelectElement).value;
    const found = this.departamentos.find((d) => d.departamento === depto);
    this.ciudades = found?.ciudades || [];
    this.searchForm.get('ciudad')?.setValue('');
    if (depto) {
      this.ubicacionSeleccionada.emit(depto); // ⬅️ Emitimos el departamento seleccionado
    }
    this.cdr.detectChanges();
  }
  emitirCiudad(event: Event) {
    const ciudad = (event.target as HTMLSelectElement).value;
    if (ciudad) {
      this.ubicacionSeleccionada.emit(ciudad); // ⬅️ Emitimos la ciudad seleccionada
    }
    this.cdr.detectChanges();
  }

  selectRooms(n: number) {
    this.selectedRooms = n;
    this.searchForm.get('rooms')?.setValue(n);
  }

  abrirModal() {
    this.mostrarMasFiltros = true;
    document.body.classList.add('modal-open'); // evita scroll
  }

  cerrarModal() {
    this.mostrarMasFiltros = false;
    document.body.classList.remove('modal-open');
  }

  aplicarFiltros() {
    this.cerrarModal();
    this.onSearch(); // dispara búsqueda
  }
}
