import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableComponent, DataTableColumn, DataTableButton } from '../data-table/data-table.component';
import { ContactosService } from '../../services/contactos.service';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.scss']
})
export class ContactsListComponent implements OnInit {
  searchText: string = '';
  contacts: any[] = [];
  filteredContacts: any[] = [];
  showModal: boolean = false;
  isEditing: boolean = false;
  contactForm: FormGroup;
  currentContact: any = null;

  columns: DataTableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'empresa', label: 'Empresa' }
  ];

  buttons: DataTableButton[] = [
    { id: 'delete', label: '🗑️', class: 'btn-danger' }
  ];

  constructor(
    private contactosService: ContactosService,
    private formBuilder: FormBuilder
  ) {
    this.contactForm = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      empresa: ['']
    });
  }

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.contactosService.getContactos().subscribe({
      next: (data) => {
        this.contacts = data;
        this.filteredContacts = [...data];
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.contacts = [];
        this.filteredContacts = [];
      }
    });
  }

  onSearch() {
    if (!this.searchText.trim()) {
      this.filteredContacts = [...this.contacts];
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredContacts = this.contacts.filter(contact =>
      Object.values(contact).some(value =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }

  onClearSearch() {
    this.searchText = '';
    this.filteredContacts = [...this.contacts];
  }

  onAddContact() {
    this.isEditing = false;
    this.currentContact = null;
    this.contactForm.reset();
    this.showModal = true;
  }

  onRowClick(contact: any) {
    this.isEditing = true;
    this.currentContact = contact;
    this.contactForm.patchValue(contact);
    this.showModal = true;
  }

  onButtonClick(event: { buttonId: string, row: any, index: number }) {
    if (event.buttonId === 'delete') {
      this.onDeleteContact(event.row);
    }
  }

  onDeleteContact(contact: any) {
    if (confirm(`¿Está seguro que desea eliminar el contacto ${contact.nombre}?`)) {
      this.contactosService.deleteContacto(contact.id).subscribe({
        next: () => {
          this.loadContacts();
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
        }
      });
    }
  }

  onSaveContact() {
    if (this.contactForm.valid) {
      const contactData = this.contactForm.value;

      if (this.isEditing) {
        this.contactosService.updateContacto(contactData).subscribe({
          next: () => {
            this.closeModal();
            this.loadContacts();
          },
          error: (error) => {
            console.error('Error updating contact:', error);
          }
        });
      } else {
        this.contactosService.addContacto(contactData).subscribe({
          next: () => {
            this.closeModal();
            this.loadContacts();
          },
          error: (error) => {
            console.error('Error adding contact:', error);
          }
        });
      }
    }
  }

  closeModal() {
    this.showModal = false;
    this.contactForm.reset();
    this.currentContact = null;
    this.isEditing = false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}