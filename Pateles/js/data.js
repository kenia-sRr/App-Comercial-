// Datos del Catálogo, Opciones de Personalización y Testimonios para Pastelería AURA

const PASTELERIA_CONFIG = {
    nombre: "AURA Pâtisserie",
    slogan: "Repostería de Autor, Estética Minimalista y Sabor Inolvidable",
    telefonoWhatsApp: "5215512345678", // Número para recibir pedidos directos
    horario: "Lunes a Sábado: 8:00 AM - 8:00 PM | Domingo: 9:00 AM - 6:00 PM",
    direccion: "Av. Chapultepec 420, Colonia Roma Norte, CDMX",
    moneda: "MXN",
    simboloMoneda: "$"
};

const PRODUCTOS = [
    {
        id: "pastel-01",
        nombre: "Velvet Cacao & Flor de Sal",
        categoria: "signature",
        categoriaNombre: "Pasteles de Autor",
        precio: 680,
        porciones: "10 - 12 porciones",
        badge: "Bestseller",
        imagen: "assets/images/pastel-01.jpg",
        imagenFallback: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
        descripcionCorta: "Bizcocho suave de cacao puro con ganache batido y cristales de flor de sal.",
        descripcionLarga: "Una obra maestra de equilibrio. Tres capas de bizcocho esponjoso con cacao 70% de origen veracruzano, humedecido con infusión de café espresso y relleno con una sedosa ganache batida de chocolate belga, coronado con una pizca de flor de sal de Colima.",
        ingredientes: ["Cacao 70%", "Harina orgánica", "Mantequilla de pastoreo", "Vainilla Bourbon", "Café de especialidad"],
        alergenos: ["Gluten", "Lácteos", "Huevo"]
    },
    {
        id: "pastel-02",
        nombre: "Vainilla Bourbon & Frambuesa Silvestre",
        categoria: "celebration",
        categoriaNombre: "Celebraciones",
        precio: 640,
        porciones: "8 - 10 porciones",
        badge: "Favorito",
        imagen: "assets/images/pastel-02.jpg",
        imagenFallback: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80",
        descripcionCorta: "Crema de mantequilla suiza, compota artesanal de frambuesas y vaina natural.",
        descripcionLarga: "Elegante y fresco. Bizcocho de vainilla bourbon de Madagascar empapado en almíbar ligero de azahar, relleno de compota casera reducida a fuego lento con frambuesas frescas y cubierta con un suave merengue suizo ultra ligero.",
        ingredientes: ["Frambuesas frescas", "Vainas de vainilla", "Azúcar de caña", "Mantequilla europea"],
        alergenos: ["Gluten", "Lácteos", "Huevo"]
    },
    {
        id: "pastel-03",
        nombre: "Nube de Limón Meyer & Amapola",
        categoria: "signature",
        categoriaNombre: "Pasteles de Autor",
        precio: 590,
        porciones: "8 - 10 porciones",
        badge: "Cítrico & Ligero",
        imagen: "assets/images/pastel-03.jpg",
        imagenFallback: "https://images.unsplash.com/photo-1534432182912-63863115e106?auto=format&fit=crop&w=900&q=80",
        descripcionCorta: "Curd sedoso de limón Meyer, semillas de amapola tostadas y merengue tostado.",
        descripcionLarga: "Un bocado refrescante y aromático. El bizcocho incorpora ralladura fina de limones Meyer orgánicos y amapola crujiente. Relleno con nuestro lemon curd artesanal de acidez balanceada y cobertura minimalista de mascarpone.",
        ingredientes: ["Limón Meyer", "Semillas de amapola", "Queso mascarpone", "Huevos de granja"],
        alergenos: ["Gluten", "Lácteos", "Huevo"]
    },
    {
        id: "pastel-04",
        nombre: "Pistacho de Bronte & Rosa",
        categoria: "wedding",
        categoriaNombre: "Bodas & Eventos",
        precio: 1250,
        porciones: "18 - 20 porciones",
        badge: "Exclusivo",
        imagen: "assets/images/pastel-04.jpg",
        imagenFallback: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=80",
        descripcionCorta: "Crema diplomática de pistachos sicilianos, toque de agua de rosas y hojas de oro.",
        descripcionLarga: "Diseñado para los momentos más memorables. Bizcocho húmedo elaborado con harina de pistacho 100% puro importado, intercalado con crema diplomática ligera y un sutil rocío de destilado botánico de rosas orgánicas. Terminado con detalles en hoja de oro de 24k.",
        ingredientes: ["Pistacho puro", "Agua de rosas", "Chocolate blanco 34%", "Hoja de oro comestible"],
        alergenos: ["Frutos secos", "Gluten", "Lácteos", "Huevo"]
    },
    {
        id: "pastel-05",
        nombre: "Zanahoria Rústica & Nuez Pecana",
        categoria: "celebration",
        categoriaNombre: "Celebraciones",
        precio: 580,
        porciones: "10 - 12 porciones",
        badge: "Clásico Redefinido",
        imagen: "assets/images/pastel-05.jpg",
        imagenFallback: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=900&q=80",
        descripcionCorta: "Especias cálidas de Ceilán, nueces tostadas y glaseado suave de queso crema.",
        descripcionLarga: "La versión más refinada del pastel de zanahoria. Ralladura fresca de zanahoria, canela de Ceilán en rama molida al momento, nuez pecana troceada y el legendario frosting de queso crema con toque cítrico.",
        ingredientes: ["Zanahoria orgánica", "Nuez pecana", "Canela Ceilán", "Queso crema de origen"],
        alergenos: ["Frutos secos", "Gluten", "Lácteos", "Huevo"]
    },
    {
        id: "pastel-06",
        nombre: "Tarta Tatin Contemporánea",
        categoria: "individual",
        categoriaNombre: "Individuales & Tartas",
        precio: 490,
        porciones: "6 - 8 porciones",
        badge: "Temporada",
        imagen: "assets/images/pastel-06.jpg",
        imagenFallback: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80",
        descripcionCorta: "Manzanas caramelizadas al punto toffee sobre hojaldre francés invertido de 144 capas.",
        descripcionLarga: "Homenaje a la alta pastelería parisina. Manzanas Golden horneadas lentamente durante 4 horas en caramelo rubio con mantequilla avellanada sobre una base de hojaldre crujiente.",
        ingredientes: ["Manzanas seleccionadas", "Mantequilla francesa", "Caramelo de caña"],
        alergenos: ["Gluten", "Lácteos"]
    },
    {
        id: "pastel-07",
        nombre: "Caja de Macarons Minimalistas (12 pzs)",
        categoria: "individual",
        categoriaNombre: "Individuales & Tartas",
        precio: 390,
        porciones: "12 unidades",
        badge: "Regalo Ideal",
        imagen: "assets/images/pastel-07.jpg",
        imagenFallback: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=900&q=80",
        descripcionCorta: "Sabores surtidos: Lavanda & Miel, Chocolate Oscuro, Matcha Ceremonial y Vainilla.",
        descripcionLarga: "Macarons de corteza ultradelgada y corazón sedoso. Presentados en estuche rígido minimalista blanco mate con sello en relieve, ideales para obsequiar.",
        ingredientes: ["Harina de almendra", "Claras pasteurizadas", "Matcha grado ceremonial", "Lavanda"],
        alergenos: ["Frutos secos", "Lácteos", "Huevo"]
    },
    {
        id: "pastel-08",
        nombre: "Tarta Pavlova Frutos Rojos (Gluten Free)",
        categoria: "signature",
        categoriaNombre: "Pasteles de Autor",
        precio: 620,
        porciones: "8 - 10 porciones",
        badge: "Sin Gluten",
        imagen: "assets/images/pastel-08.jpg",
        imagenFallback: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
        descripcionCorta: "Merengue crujiente por fuera y marshmallow por dentro, crema chantilly y frutos del bosque.",
        descripcionLarga: "Una opción naturalmente libre de gluten. Base etérea de merengue con toque de vainilla, coronada con crema chantilly recién batida, zarzamoras, arándanos y reducción de frutos rojos.",
        ingredientes: ["Claras de huevo", "Crema para batir", "Frutos del bosque", "Vainilla natural"],
        alergenos: ["Lácteos", "Huevo"]
    }
];

// Opciones interactivas para "Diseña tu Pastel"
const PERSONALIZADOR_CONFIG = {
    tamanos: [
        { id: "mini", nombre: "Íntimo / Mini", porciones: "6 a 8 personas", precioBase: 520 },
        { id: "medio", nombre: "Medio / Estándar", porciones: "12 a 15 personas", precioBase: 780, recomendado: true },
        { id: "grande", nombre: "Celebración / Fiesta", porciones: "20 a 25 personas", precioBase: 1150 },
        { id: "evento", nombre: "Boda / Magno Evento (2 niveles)", porciones: "40 a 50 personas", precioBase: 2400 }
    ],
    bizcochos: [
        { id: "vainilla", nombre: "Vainilla de Madagascar", descripcion: "Clásico, sedoso y aromático", extra: 0 },
        { id: "cacao", nombre: "Cacao Intenso 70%", descripcion: "Profundo, húmedo y chocolatoso", extra: 40 },
        { id: "red-velvet", nombre: "Red Velvet AURA", descripcion: "Textura aterciopelada y sutil toque a cacao", extra: 50 },
        { id: "zanahoria", nombre: "Zanahoria & Nueces", descripcion: "Especias cálidas y trozos crocantes", extra: 60 },
        { id: "limon-amapola", nombre: "Limón Meyer & Amapola", descripcion: "Fresco, cítrico y delicado", extra: 50 }
    ],
    rellenos: [
        { id: "ganache-maracuya", nombre: "Ganache de Maracuyá & Chocolate Blanco", extra: 0 },
        { id: "frutos-bosque", nombre: "Compota Artesanal de Frutos del Bosque", extra: 0 },
        { id: "dulce-leche", nombre: "Dulce de Leche Casero & Nuez", extra: 30 },
        { id: "pistacho", nombre: "Crema Pura de Pistacho Bronte", extra: 90 },
        { id: "avellana", nombre: "Praliné Crujiente de Avellanas", extra: 70 }
    ],
    coberturas: [
        { id: "semi-naked", nombre: "Semi-Naked Rústico", descripcion: "Capas visibles de bizcocho con acabado orgánico", extra: 0 },
        { id: "liso-minimal", nombre: "Liso Minimalista Blanco", descripcion: "Bordes rectos perfectos estilo editorial", extra: 50 },
        { id: "ondas", nombre: "Espatulado con Textura Suave", descripcion: "Ondas sutiles hechas a mano", extra: 60 },
        { id: "glaseado-espejo", nombre: "Glaseado Espejo Brillante", descripcion: "Efecto pulido moderno y sofisticado", extra: 110 }
    ],
    extras: [
        { id: "flores", nombre: "Flores Naturales Comestibles u Orgánicas", precio: 120 },
        { id: "oro", nombre: "Detalles en Hoja de Oro Comestible 24k", precio: 150 },
        { id: "macarons", nombre: "Top de Macarons Artesanales (4 pzs)", precio: 130 },
        { id: "topper", nombre: "Topper Acrílico Personalizado con Nombre/Frase", precio: 180 }
    ]
};

const TESTIMONIOS = [
    {
        nombre: "Sofía M. & Daniel R.",
        tipo: "Pastel de Bodas",
        comentario: "El pastel de Pistacho y Rosas fue el centro de atención de nuestra boda. No solo era visualmente impecable y minimalista, sino que todos los invitados preguntaron dónde lo habíamos pedido. ¡Inolvidable!",
        estrellas: 5,
        fecha: "Hace 2 semanas"
    },
    {
        nombre: "Carlos Valenzuela",
        tipo: "Cumpleaños sorpresa",
        comentario: "El Velvet Cacao con flor de sal superó cualquier expectativa. El pedido por la página y la confirmación por WhatsApp fueron inmediatos. Llegó en perfecto estado y con empaque de lujo.",
        estrellas: 5,
        fecha: "Hace 1 mes"
    },
    {
        nombre: "Dra. Valentina Lozano",
        tipo: "Evento Corporativo",
        comentario: "La estética limpia, sin colores artificiales estrafalarios y con sabores tan elegantes es justo lo que buscábamos para nuestra celebración de despacho. Calidad 10/10.",
        estrellas: 5,
        fecha: "Hace 3 semanas"
    }
];

const FAQS = [
    {
        pregunta: "¿Con cuánta anticipación debo realizar mi pedido?",
        respuesta: "Para nuestros pasteles de catálogo recomendamos realizar el pedido con al menos 24 a 48 horas de anticipación. Para pasteles personalizados o pedidos de bodas/eventos, sugerimos entre 5 y 15 días para garantizar disponibilidad y diseño a medida."
    },
    {
        pregunta: "¿Cuentan con servicio de entrega a domicilio?",
        respuesta: "Sí, realizamos entregas en vehículo climatizado especial para repostería fina en toda la zona metropolitana. También puedes recoger personalmente en nuestro taller en Roma Norte con horario programado."
    },
    {
        pregunta: "¿Pueden adaptar opciones sin gluten o veganas?",
        respuesta: "¡Por supuesto! Contamos con opciones permanentemente en carta como nuestra Pavlova de frutos rojos (libre de gluten) y podemos elaborar pasteles especiales bajo encargo previo cuidando al máximo la manipulación."
    },
    {
        pregunta: "¿Cómo se confirma y paga un pedido?",
        respuesta: "Puedes armar tu pedido o personalizar tu pastel aquí en la web y enviarlo directamente a nuestro WhatsApp con un solo clic. Aceptamos transferencias bancarias, tarjetas de crédito/débito y pagos con link digital seguro."
    }
];
