// server.js - VERSIÓN FINAL CON DATOS ALEATORIOS
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Hermesmusic15',
  database: 'gestion_pacientes'
});

db.connect((err) => {
  if (err) {
    console.error('❌ ERROR MySQL:', err.message);
  } else {
    console.log('✅ Conectado a MySQL');
  }
});

// ==================== FUNCIONES ALEATORIAS ====================

function generarTemperatura() {
  return (Math.random() * 4 + 35.5).toFixed(1);
}

function generarMovimiento() {
  const niveles = ['poco', 'estable', 'mucho'];
  return niveles[Math.floor(Math.random() * niveles.length)];
}

function generarUmbral() {
  return Math.floor(Math.random() * 50) + 20;
}

// ==================== RUTAS PRINCIPALES ====================

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para mostrar pacientes - ¡ACTUALIZA DATOS CADA VEZ QUE SE VISITA!
app.get('/pacientes', (req, res) => {
  console.log('🔄 Refrescando página - Actualizando datos de todos los pacientes...');
  
  // Primero: Obtener TODOS los pacientes
  db.query('SELECT id FROM pacientes', (err, pacientes) => {
    if (err) {
      console.error('Error obteniendo pacientes:', err);
      return res.send(`<h1>Error: ${err.message}</h1>`);
    }
    
    if (pacientes.length === 0) {
      return res.send(`
        <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1>📋 No hay pacientes registrados</h1>
          <button onclick="window.location.href='/'">🏠 Volver al Inicio</button>
        </body>
        </html>
      `);
    }
    
    let pacientesActualizados = 0;
    const totalPacientes = pacientes.length;
    
    // Función para actualizar datos de un paciente
    const actualizarPaciente = (index) => {
      if (index >= pacientes.length) {
        console.log(`✅ Todos los pacientes actualizados (${totalPacientes})`);
        mostrarTabla();
        return;
      }
      
      const pacienteId = pacientes[index].id;
      const cuadrantes = ['A', 'B', 'C', 'D', 'E', 'F'];
      
      // Eliminar cuadrantes existentes
      db.query('DELETE FROM cuadrantes_camilla WHERE paciente_id = ?', [pacienteId], (err) => {
        if (err) {
          console.error(`Error eliminando cuadrantes del paciente ${pacienteId}:`, err);
        }
        
        let cuadrantesInsertados = 0;
        
        // Insertar nuevos cuadrantes
        cuadrantes.forEach((cuadrante, i) => {
          const temperatura = generarTemperatura();
          const nivelMovimiento = generarMovimiento();
          const umbralMovimiento = generarUmbral();
          
          const sql = `
            INSERT INTO cuadrantes_camilla 
            (paciente_id, cuadrante, temperatura, nivel_movimiento, umbral_movimiento) 
            VALUES (?, ?, ?, ?, ?)
          `;
          
          db.query(sql, [pacienteId, cuadrante, temperatura, nivelMovimiento, umbralMovimiento], (err) => {
            if (err) {
              console.error(`Error insertando cuadrante ${cuadrante} para paciente ${pacienteId}:`, err);
            }
            
            cuadrantesInsertados++;
            
            if (cuadrantesInsertados === cuadrantes.length) {
              pacientesActualizados++;
              console.log(`  ✅ Paciente ${pacienteId}: 6 cuadrantes actualizados`);
              actualizarPaciente(index + 1);
            }
          });
        });
      });
    };
    
    // Función para mostrar la tabla
    function mostrarTabla() {
      const query = `
        SELECT 
          p.*,
          GROUP_CONCAT(CONCAT(c.cuadrante, ': ', c.temperatura, '°C') ORDER BY c.cuadrante SEPARATOR ', ') as temperaturas,
          GROUP_CONCAT(CONCAT(c.cuadrante, ': ', c.nivel_movimiento, ' (umbral: ', c.umbral_movimiento, ')') ORDER BY c.cuadrante SEPARATOR ', ') as movimientos,
          p.fecha_registro
        FROM pacientes p
        LEFT JOIN cuadrantes_camilla c ON p.id = c.paciente_id
        GROUP BY p.id
        ORDER BY p.id
      `;
      
      db.query(query, (err, resultados) => {
        if (err) {
          console.error('Error obteniendo datos actualizados:', err);
          return res.send(`<h1>Error: ${err.message}</h1>`);
        }
        
        let html = `
          <html>
          <head>
            <style>
              body { 
                font-family: 'Arial', sans-serif; 
                padding: 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
              }
              .container {
                max-width: 1400px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.2);
              }
              h1 { 
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
                font-size: 2.5em;
              }
              .header-info {
                background: #3498db;
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin-bottom: 30px;
              }
              th, td { 
                padding: 12px 15px; 
                border: 1px solid #ddd; 
                text-align: left;
                color: #333;
              }
              th { 
                background: #2c3e50;
                color: white; 
                font-weight: bold;
                font-size: 16px;
              }
              tr:nth-child(even) {
                background-color: #f8f9fa;
              }
              tr:hover {
                background-color: #e8f4fc;
              }
              .cuadrante-data {
                background: #e8f4fc;
                padding: 8px;
                margin: 4px 0;
                border-radius: 4px;
                font-size: 13px;
                border-left: 3px solid #3498db;
                color: #2c3e50;
              }
              .poco { 
                border-left-color: #27ae60 !important;
                background: #e8f6f3;
                color: #155724;
              }
              .estable { 
                border-left-color: #f39c12 !important;
                background: #fef5e7;
                color: #856404;
              }
              .mucho { 
                border-left-color: #e74c3c !important;
                background: #fdedec;
                color: #721c24;
              }
              .btn { 
                padding: 12px 25px; 
                background: #3498db; 
                color: white; 
                border: none; 
                border-radius: 6px; 
                cursor: pointer; 
                margin: 5px;
                font-size: 16px;
                font-weight: bold;
                transition: all 0.3s;
              }
              .btn:hover {
                background: #2980b9;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
              }
              .btn-refresh {
                background: #2ecc71;
              }
              .btn-refresh:hover {
                background: #27ae60;
              }
              .timestamp {
                font-size: 12px;
                color: #7f8c8d;
                text-align: center;
                margin-top: 20px;
              }
              .stats {
                display: flex;
                justify-content: space-between;
                background: #2c3e50;
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              .stat-item {
                text-align: center;
              }
              .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #3498db;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>📊 MONITOREO DE PACIENTES EN TIEMPO REAL</h1>
              
              <div class="stats">
                <div class="stat-item">
                  <div>Pacientes Totales</div>
                  <div class="stat-value">${resultados.length}</div>
                </div>
                <div class="stat-item">
                  <div>Última Actualización</div>
                  <div class="stat-value">${new Date().toLocaleTimeString()}</div>
                </div>
                <div class="stat-item">
                  <div>Cuadrantes por Paciente</div>
                  <div class="stat-value">6</div>
                </div>
              </div>
              
              <div class="header-info">
                <h3>🔄 Datos actualizados automáticamente</h3>
                <p>Cada vez que refrescas esta página, se generan nuevos datos aleatorios para todos los pacientes</p>
              </div>
              
              <div style="text-align: center; margin-bottom: 20px;">
                <button class="btn" onclick="window.location.href='/'">🏠 Página Principal</button>
                <button class="btn btn-refresh" onclick="window.location.reload()">🔄 Actualizar Ahora</button>
              </div>
        `;
        
        // Tabla de pacientes
        html += `<table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Paciente</th>
              <th>Edad</th>
              <th>Frecuencia Cardíaca</th>
              <th>TEMPERATURAS POR CUADRANTE (°C)</th>
              <th>MOVIMIENTO POR CUADRANTE (umbral toques/min)</th>
              <th>Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>`;
        
        resultados.forEach(paciente => {
          const tempItems = paciente.temperaturas ? paciente.temperaturas.split(', ') : [];
          const movItems = paciente.movimientos ? paciente.movimientos.split(', ') : [];
          
          html += `
            <tr>
              <td><strong>#${paciente.id}</strong></td>
              <td><strong>${paciente.nombre}</strong></td>
              <td>${paciente.edad} años</td>
              <td>${paciente.frecuencia_cardiaca} bpm</td>
              <td>
          `;
          
          if (tempItems.length > 0) {
            tempItems.forEach(item => {
              html += `<div class="cuadrante-data">${item}</div>`;
            });
          } else {
            html += `<div class="cuadrante-data" style="color: #999;">Sin datos de temperatura</div>`;
          }
          
          html += `</td><td>`;
          
          if (movItems.length > 0) {
            movItems.forEach(item => {
              const claseMov = item.includes('poco') ? 'poco' : 
                               item.includes('estable') ? 'estable' : 'mucho';
              html += `<div class="cuadrante-data ${claseMov}">${item}</div>`;
            });
          } else {
            html += `<div class="cuadrante-data" style="color: #999;">Sin datos de movimiento</div>`;
          }
          
          html += `</td>
              <td>${new Date(paciente.fecha_registro).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</td>
            </tr>
          `;
        });
        
        html += `
          </tbody>
        </table>
        
        <div class="timestamp">
          <p>Página generada el: ${new Date().toLocaleString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}</p>
          <p>Los datos se actualizan automáticamente cada vez que se visita esta página</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <button class="btn" onclick="window.location.href='/'">🏠 Volver al Inicio</button>
          <button class="btn btn-refresh" onclick="window.location.reload()">🔄 Actualizar Datos</button>
        </div>
        
        </div>
        </body>
        </html>
        `;
        
        res.send(html);
      });
    }
    
    // Comenzar a actualizar pacientes
    actualizarPaciente(0);
  });
});

// ==================== INICIAR SERVIDOR ====================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Ver pacientes (actualiza datos): http://localhost:${PORT}/pacientes`);
  console.log('⚠️ NOTA: Cada vez que visites /pacientes, se actualizarán TODOS los datos de los cuadrantes');
});
