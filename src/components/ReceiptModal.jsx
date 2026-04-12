import { useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function ReceiptModal({ venta, onClose }) {
  const receiptRef = useRef()

  if (!venta) return null

  const formatCOP = (n) =>
    new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0 
    }).format(n)

  const formatFecha = (f) => {
    if (!f) return '-'
    let date
    if (f instanceof Date) {
      date = f
    } else {
      // Si es string YYYY-MM-DD, añadir T12:00:00 para evitar problemas de zona horaria
      date = new Date(f.includes('T') ? f : f + 'T12:00:00')
    }
    
    if (isNaN(date.getTime())) return '-'
    
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const descargarPDF = async () => {
    const element = receiptRef.current
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    
    // Ancho de una tirilla típica (80mm ≈ 226px a 72dpi, pero escalamos para calidad)
    const pdf = new jsPDF({
      unit: 'mm',
      format: [80, 200] // Ajustaremos el largo dinámicamente
    })
    
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    // Crear PDF con el alto exacto de la imagen
    const finalPdf = new jsPDF({
      unit: 'mm',
      format: [80, pdfHeight + 10]
    })
    
    finalPdf.addImage(imgData, 'PNG', 0, 5, pdfWidth, pdfHeight)
    finalPdf.save(`recibo-venta-${venta.id}.pdf`)
  }

  return (
    <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ background: 'var(--bg-secondary)', borderRadius: '20px' }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title w-100 text-center" style={{ fontWeight: 800, color: 'var(--text-main)' }}>Previsualización de Recibo</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            {/* Area de la Tirilla */}
            <div 
               ref={receiptRef}
               style={{ 
                 background: '#fff', 
                 color: '#000', 
                 padding: '30px 20px', 
                 fontFamily: "'Courier New', Courier, monospace",
                 fontSize: '12px',
                 lineHeight: '1.4',
                 boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                 borderRadius: '2px'
               }}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '18px', textTransform: 'uppercase' }}>LIA BOUTIQUE</h3>
                <p style={{ margin: 0, fontSize: '10px' }}>Pasión por el calzado</p>
                <div style={{ margin: '10px 0', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0' }}>
                   RECIBO DE VENTA # {venta.id}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div><strong>Fecha:</strong> {new Date(venta.created_at).toLocaleString('es-CO')}</div>
                <div><strong>Cliente:</strong> {venta.cliente_nombre || 'Cliente General'}</div>
                {venta.cliente_telefono && <div><strong>Tel:</strong> {venta.cliente_telefono}</div>}
              </div>

              <div style={{ borderBottom: '1px solid #000', marginBottom: '10px', paddingBottom: '5px' }}>
                <div style={{ display: 'flex', fontWeight: 'bold' }}>
                  <span style={{ flex: 2 }}>Producto</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>Cant</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Total</span>
                </div>
              </div>

              {venta.items && venta.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', marginBottom: '5px' }}>
                  <span style={{ flex: 2 }}>{item.nombre_producto}</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>{item.cantidad}</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>{formatCOP(item.precio_unitario * item.cantidad)}</span>
                </div>
              ))}

              <div style={{ borderTop: '1px solid #000', marginTop: '15px', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                  <span>TOTAL:</span>
                  <span>{formatCOP(venta.total)}</span>
                </div>
                
                <div style={{ marginTop: '10px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tipo Pago:</span>
                    <span style={{ textTransform: 'uppercase' }}>{venta.tipo_pago}</span>
                  </div>
                  {venta.tipo_pago === 'credito' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Abonado:</span>
                        <span>{formatCOP(venta.abono_inicial || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Saldo Pendiente:</span>
                        <span>{formatCOP(venta.total - (venta.abono_inicial || 0))}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                        <span>Frecuencia:</span>
                        <span style={{ textTransform: 'capitalize' }}>{venta.frecuencia_pago}</span>
                      </div>
                      {venta.fecha_vencimiento && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Próximo Pago:</span>
                          <span>{formatFecha(venta.fecha_vencimiento)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '10px' }}>
                <p style={{ margin: 0 }}>¡Gracias por tu compra!</p>
                <p style={{ margin: 0 }}>Lia Boutique - Cúcuta</p>
              </div>
            </div>

            <div className="mt-4 d-grid gap-2">
               <button onClick={descargarPDF} className="btn btn-primary rounded-pill p-3 border-0 shadow-sm" style={{ background: 'var(--primary-color)', fontWeight: 700 }}>
                 <i className="bi bi-file-earmark-pdf me-2"></i> Descargar Tirilla PDF
               </button>
               <button onClick={onClose} className="btn btn-link text-muted text-decoration-none" style={{ fontSize: '0.9rem' }}>
                 Cerrar Previsualización
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal
