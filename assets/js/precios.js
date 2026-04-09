document.addEventListener("DOMContentLoaded", function () {
    // Precio base y precio para suela alta
    const precioBase = 40000; // Precio base (suela baja)
    const precioSuelaAlta = 60000; // Precio para suela alta

    // Obtener el tipo de suela desde el HTML
    const tipoSuela = document.getElementById("producto").getAttribute("data-tipo-suela") || "baja";

    // Asignar el precio según el tipo de suela
    const precioProducto = tipoSuela === "alta" ? precioSuelaAlta : precioBase;

    // Formatear el precio
    const precioFormateado = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    }).format(precioProducto);

    // Insertar el precio en el HTML
    const precioSpan = document.getElementById("precio");
    if (precioSpan) {
        precioSpan.textContent = precioFormateado;
    }

    // Tomar el resto de los datos desde el HTML
    const nombreProducto = document.getElementById("producto")?.getAttribute("data-nombre") || "Producto";
    const materialProducto = document.getElementById("material")?.textContent || "Desconocido";
    const tallasProducto = document.getElementById("tallas")?.textContent || "No disponibles";
    const imagenProducto = document.getElementById("productoImagen")?.src || "";
    const tipoSuelaProducto = document.getElementById("tipoSuela")?.textContent || "No especificado";

    // Crear mensaje para WhatsApp
    const mensaje = `Hola, estoy interesado en *${nombreProducto}*.\n
💲 *Precio*: ${precioFormateado}.\n
📌 *Material*: ${materialProducto}.\n
👡 *Tallas*: ${tallasProducto}.\n
🦶 *Tipo de Suela*: ${tipoSuelaProducto}.\n
📷 Mira la imagen aquí: ${imagenProducto}`;

    // Asignar al enlace de WhatsApp
    const whatsappLink = document.getElementById("whatsappLink");
    if (whatsappLink) {
        whatsappLink.href = `https://wa.me/+573157832101?text=${encodeURIComponent(mensaje)}`;
    }
});
