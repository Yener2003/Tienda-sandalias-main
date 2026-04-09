// document.addEventListener("DOMContentLoaded", function () {
//     // Verificar si existe el div del producto en la página
//     let productoElemento = document.getElementById("producto");
//     if (!productoElemento) return; // Si no hay producto, no hace nada
//
//     // Obtener los datos dinámicos
//     let nombreProducto = productoElemento.getAttribute("data-nombre") || "Producto";
//     let precioProducto = productoElemento.getAttribute("data-precio") || "0";
//     let materialProducto = document.getElementById("material")?.textContent || "Desconocido";
//     let tallasProducto = document.getElementById("tallas")?.textContent || "No disponibles";
//     let imagenProducto = document.getElementById("productoImagen")?.src || "";
//
//     // Crear el mensaje para WhatsApp
//     let mensaje = `Hola, estoy interesado en *${nombreProducto}*.\n
// 💲 *Precio*: $${precioProducto}.\n
// 📌 *Material*: ${materialProducto}.\n
// 👡 *Tallas*: ${tallasProducto}.\n
// 📷 Mira la imagen aquí: ${imagenProducto}`;
//
//     let url = `https://wa.me/+573157832101?text=${encodeURIComponent(mensaje)}`;
//
//     // Asignar el enlace al botón de WhatsApp
//     document.getElementById("whatsappLink").href = url;
// });
