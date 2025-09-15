<template>
  <v-card class="mx-auto my-5" max-width="1200">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5">Tareas</span>
      <v-btn color="primary" @click="abrirModalCrear" small>Crear Tarea</v-btn>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="tareas"
      class="elevation-1"
      :items-per-page="10"
      :item-class="rowClass"
    >
      <template v-slot:item.estado="{ item }">
        <v-chip
          :color="statusMeta((item && item.raw ? item.raw.estado : item.estado)).color"
          variant="tonal"
          size="small"
        >
          {{ statusMeta((item && item.raw ? item.raw.estado : item.estado)).label }}
        </v-chip>
      </template>
      <template v-slot:item.acciones="{ item, index }">
        <v-btn
          color="primary"
          @click="abrirModal(item, index)"
          :disabled="!hasId(item)"
          small
        >Editar</v-btn>
        <v-btn
          color="error"
          @click="eliminarTarea(item, index)"
          :disabled="!hasId(item)"
          small
        >Eliminar</v-btn>
      </template>
    </v-data-table>

    <!-- Modal de edición -->
    <v-dialog v-model="modal" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h6">Editar Tarea</span>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="actualizarTarea">
            <v-text-field v-model="tareaEdit.nombre" label="Nombre" required></v-text-field>
            <v-select
              v-model="tareaEdit.estado"
              :items="estadoOptions"
              item-title="title"
              item-value="value"
              label="Estado"
              required
            />
            <v-text-field v-model="tareaEdit.fecha_vencimiento" label="Fecha Vencimiento" required></v-text-field>
            <v-select
              v-model="tareaEdit.usuario_id"
              :items="usuarios"
              item-title="nombre"
              item-value="id"
              label="Usuario"
              required
            ></v-select>
            <v-card-actions>
              <v-btn color="primary" type="submit">Guardar</v-btn>
              <v-btn text @click="cerrarModal">Cancelar</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal de creación -->
    <v-dialog v-model="modalCrear" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h6">Crear Tarea</span>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="crearTarea">
            <v-text-field v-model="nuevaTarea.nombre" label="Nombre" required></v-text-field>
            <v-text-field v-model="nuevaTarea.descripcion" label="Descripción" required></v-text-field>
            <v-select
              v-model="nuevaTarea.estado"
              :items="estadoOptions"
              item-title="title"
              item-value="value"
              label="Estado"
              required
            />
            <v-select
              v-model="nuevaTarea.usuario_id"
              :items="usuarios"
              item-title="nombre"
              item-value="id"
              label="Usuario"
              required
            ></v-select>
            <v-text-field v-model="nuevaTarea.fecha_vencimiento" label="Fecha Vencimiento" required></v-text-field>
            <v-card-actions>
              <v-btn color="primary" type="submit">Crear</v-btn>
              <v-btn text @click="cerrarModalCrear">Cancelar</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import api, { ensureCsrf } from '@/services/api'

export default {
  data() {
    return {
      tareas: [],
      tareaEdit: {
        nombre: '',
        estado: '',
        fecha_vencimiento: '',
        usuario_id: null
      },
      tareaEditIdx: null,
  tareaEditId: null,
      modal: false,
      // Modal de creación
      modalCrear: false,
      nuevaTarea: {
        nombre: '',
        descripcion: '',
        estado: 'Pendiente',
        usuario_id: null,
        fecha_vencimiento: ''
      },
      usuarios: [],
      estadoOptions: [
        { title: 'Pendiente', value: 'Pendiente' },
        { title: 'En progreso', value: 'en_progreso' },
        { title: 'Completada', value: 'completada' },
      ],
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Nombre', value: 'nombre' },
        { text: 'Estado', value: 'estado' },
        { text: 'Fecha Vencimiento', value: 'fecha_vencimiento' },
        { text: 'Usuario', value: 'usuario' },
        { text: 'Acciones', value: 'acciones', sortable: false }
      ]
    };
  },
  methods: {
    normalizeEstado(val) {
      if (!val) return ''
      const v = String(val).toLowerCase().trim().replace(/\s+/g, '_')
      if (v === 'pendiente') return 'Pendiente'
      if (v === 'en_progreso') return 'en_progreso'
      if (v === 'en' || v === 'en_progreso' || v === 'en-progreso') return 'en_progreso'
      if (v === 'completada' || v === 'completado') return 'completada'
      return val
    },
    statusMeta(val) {
      const v = this.normalizeEstado(val)
      if (v === 'Pendiente') return { label: 'Pendiente', color: 'warning', row: 'row-pendiente' }
      if (v === 'en_progreso') return { label: 'En progreso', color: 'info', row: 'row-progreso' }
      if (v === 'completada') return { label: 'Completada', color: 'success', row: 'row-completada' }
      return { label: val || '-', color: 'default', row: '' }
    },
    rowClass(row) {
      const tarea = row && row.raw ? row.raw : row
      const meta = this.statusMeta(tarea?.estado)
      return meta.row
    },
    async fetchUsuarios() {
      const { data } = await api.get('/usuarios/listUsers')
      // Solo tomar nombre e id
      this.usuarios = (data || []).map((u) => ({ nombre: u.nombre, id: u.id }))
    },
    abrirModalCrear() {
      this.nuevaTarea = {
        nombre: '',
        descripcion: '',
        estado: '',
        usuario_id: null,
        fecha_vencimiento: ''
      };
      this.modalCrear = true;
      this.fetchUsuarios();
    },
    cerrarModalCrear() {
      this.modalCrear = false;
    },
    async crearTarea() {
      try {
        await ensureCsrf()
        await api.post('/tareas/addTask', this.nuevaTarea)
        await this.fetchTareas()
        this.cerrarModalCrear()
      } catch (err) {
        const e = err || {}
        const msg = e.response?.data?.message || e.message || 'Error al crear tarea'
        console.error('crearTarea error:', e.response || e)
        alert(msg)
      }
    },
    async fetchTareas() {
      const { data } = await api.get('/tareas/listTasks')
      this.tareas = (data || []).map((t) => {
        const id = t.id || t.tarea_id || t.id_tarea || t.ID || t.Id || null
        return { ...t, id }
      })
    },
    // Devuelve el ID real de la tarea a partir de posibles nombres de campo (sin usar índice)
    idFromTarea(tarea) {
      if (!tarea) return null
      const raw = tarea && tarea.raw ? tarea.raw : tarea
      return raw.id || raw.tarea_id || raw.id_tarea || raw.ID || raw.Id || null
    },
    hasId(row) {
      return !!this.idFromTarea(row)
    },
    
    async abrirModal(row, idx) {
      const tarea = row && row.raw ? row.raw : row
      if (!tarea) return
      this.tareaEdit = { ...tarea };
      this.tareaEdit.estado = this.normalizeEstado(this.tareaEdit.estado)
      if (!this.usuarios || this.usuarios.length === 0) {
        await this.fetchUsuarios()
      }
      // Buscar el ID del usuario basado en el nombre
      const nombreUsuario = tarea.usuario || tarea.usuario_nombre || tarea.user || tarea.user_name
      const usuarioEncontrado = this.usuarios.find(u => u.nombre === nombreUsuario);
      this.tareaEdit.usuario_id = usuarioEncontrado ? usuarioEncontrado.id : null;
      this.tareaEditIdx = typeof idx === 'number' ? idx : null
      this.tareaEditId = this.idFromTarea(tarea)
      if (!this.tareaEditId) {
        console.warn('No se encontró ID en la fila seleccionada. Verifica que el listado incluya id/tarea_id/id_tarea.')
        alert('No se encontró el ID de la tarea en el listado. No es posible editar esta fila.')
        return
      }
      this.modal = true;
    },
    cerrarModal() {
      this.modal = false;
      this.tareaEditIdx = null;
    },
    async actualizarTarea() {
      try {
        const tareaId = this.tareaEditId
        if (!tareaId) throw new Error('No se pudo determinar el ID de la tarea')
        const updateData = {
          nombre: this.tareaEdit.nombre,
          estado: this.tareaEdit.estado,
          fecha_vencimiento: this.tareaEdit.fecha_vencimiento,
          usuario_id: this.tareaEdit.usuario_id,
        }
        if (this.tareaEdit.descripcion !== undefined) {
          updateData.descripcion = this.tareaEdit.descripcion
        }

        console.log('Updating task:', tareaId)
        console.log('Update data:', updateData)

        await ensureCsrf()
        await api.put(`/tareas/updateTask/${tareaId}`, updateData)
        await this.fetchTareas()
        this.cerrarModal()
      } catch (err) {
        const e = err || {}
        const status = e.response?.status
        const data = e.response?.data
        console.error('Error al actualizar:', status, data || e)
        const msg = data?.message || `Error al actualizar${status ? ' ' + status : ''}`
        alert(msg)
      }
    },
    async eliminarTarea(row, idx) {
      try {
        const tarea = row && row.raw ? row.raw : row
        const tareaId = this.idFromTarea(tarea)
        if (!tareaId) throw new Error('No se pudo determinar el ID de la tarea')
        const confirmar = confirm(`¿Eliminar la tarea \"${tarea?.nombre ?? tareaId}\"?`)
        if (!confirmar) return
        await ensureCsrf()
        await api.delete(`/tareas/deleteTask/${tareaId}`)
        await this.fetchTareas()
      } catch (err) {
        const e = err || {}
        const status = e.response?.status
        const data = e.response?.data
        console.error('Error al eliminar:', status, data || e)
        alert(data?.message || 'Error al eliminar la tarea')
      }
    }
  },
  mounted() {
  this.fetchUsuarios();
  this.fetchTareas();
  }
};
</script>

<style scoped>
.row-pendiente {
  background-color: #fff8e1; /* amber-50 */
}
.row-progreso {
  background-color: #e3f2fd; /* blue-50 */
}
.row-completada {
  background-color: #e8f5e9; /* green-50 */
}
</style>
