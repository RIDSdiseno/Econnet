
const normalizarTexto = (texto = "") => {
    return texto
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
};

const comunasGranSantiago = [
    "Santiago",
    "Providencia",
    "Las Condes",
    "Ñuñoa",
    "La Florida",
    "Maipú",
    "Puente Alto",
    "San Miguel",
    "San Joaquín",
    "Macul",
    "Peñalolén",
    "La Reina",
    "Vitacura",
    "Recoleta",
    "Independencia",
    "Quinta Normal",
    "Estación Central",
    "Cerrillos",
    "Pedro Aguirre Cerda",
    "Lo Espejo",
    "La Cisterna",
    "El Bosque",
    "San Ramón",
    "La Granja",
    "La Pintana",
    "Conchalí",
    "Huechuraba",
    "Renca",
    "Cerro Navia",
    "Lo Prado",
    "Pudahuel",
    "Quilicura",
];

const regionesCentro = [
    "Valparaíso",
    "O'Higgins",
    "Libertador General Bernardo O'Higgins",
    "Maule",
    "Ñuble",
    "Biobío",
];

const regionesIntermedias = [
    "Coquimbo",
    "La Araucanía",
    "Araucanía",
    "Los Ríos",
    "Los Lagos",
];

const regionesExtremas = [
    "Arica y Parinacota",
    "Tarapacá",
    "Antofagasta",
    "Atacama",
    "Aysén",
    "Aysén del General Carlos Ibáñez del Campo",
    "Magallanes",
    "Magallanes y de la Antártica Chilena",
];

export const obtenerCodigoZonaDespacho = (tipoEntrega, direccion) => {
    if (tipoEntrega === "retiro") {
        return "RETIRO";
    }
    const region = direccion?.region || "";
    const comuna = direccion?.comuna || "";

    const regionNormalizada = normalizarTexto(region);
    const comunaNormalizada = normalizarTexto(comuna);
    
    if (regionNormalizada === normalizarTexto("Región Metropolitana")) {
        const comunasGranSantiagoNormalizadas = comunasGranSantiago.map((item) =>
            normalizarTexto(item),
        );

        if (comunasGranSantiagoNormalizadas.includes(comunaNormalizada)) {
            return "GRAN_SANTIAGO";
        }

        return "RM_OTRAS";
    }

    if (regionesCentro.includes(region)) {
        return "CENTRO";
    }

    if (regionesIntermedias.includes(region)) {
        return "INTERMEDIA";
    }

    if (regionesExtremas.includes(region)) {
        return "EXTREMA";
    }

    return "EXTREMA";
};

export const obtenerTarifaDespacho = async (clientePrisma, tipoEntrega, direccion) => {
    const codigoZona = obtenerCodigoZonaDespacho(tipoEntrega, direccion);

    if (codigoZona === "RETIRO") {
        return {
            codigo: "RETIRO",
            nombre: "Retiro en tienda",
            precio: 0,
        };
    }

    const tarifa = await clientePrisma.tarifaDespacho.findUnique({
        where: {
            codigo: codigoZona,
        },
    });

    if (!tarifa || !tarifa.activo) {
        throw new Error(`No existe una tarifa activa para la zona ${codigoZona}`);
    }

    return {
        codigo: tarifa.codigo,
        nombre: tarifa.nombre,
        precio: tarifa.precio,
    };
};