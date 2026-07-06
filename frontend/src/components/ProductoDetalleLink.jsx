import { Link } from "react-router-dom";
import { crearRutaDetalleProducto } from "../utils/productoId";

function ProductoDetalleLink({ productoId, children, ...props }) {
  const rutaDetalle = crearRutaDetalleProducto(productoId);

  if (!rutaDetalle) {
    return <div {...props}>{children}</div>;
  }

  return (
    <Link to={rutaDetalle} {...props}>
      {children}
    </Link>
  );
}

export default ProductoDetalleLink;
