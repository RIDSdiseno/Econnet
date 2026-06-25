import {
  InstagramOutlined,
  LinkedinFilled,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const redesSociales = {
  instagram: "https://www.instagram.com/econnet.cl/",
  tiktok: "https://www.tiktok.com/@econnet.cl",
  linkedin: "https://www.linkedin.com/in/econnet-cl-502895402/",
};

const footerSections = [
  {
    title: "Ayuda",
    links: [
      {
        label: "Centro de ayuda",
        to: "/centro-ayuda",
      },
      {
        label: "Seguimiento de mi compra",
        to: "/seguimiento-compra",
      },
      {
        label: "Formulario de contacto",
        to: "/contacto",
      },
    ],
  },
  {
    title: "Nosotros",
    links: [
      {
        label: "Quiénes somos",
        to: "/quienes-somos",
      },
      {
        label: "Términos y condiciones",
        to: "/terminos-condiciones",
      },
      {
        label: "Políticas de privacidad",
        to: "/politicas-privacidad",
      },
    ],
  },
  {
    title: "Comunidad",
    links: [
      {
        label: "Instagram",
        href: redesSociales.instagram,
        external: true,
      },
      {
        label: "TikTok",
        href: redesSociales.tiktok,
        external: true,
      },
      {
        label: "LinkedIn",
        href: redesSociales.linkedin,
        external: true,
      },
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-gray-950 text-white mt-12">
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Primera fila: columnas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="border-l-4 border-gray-400 pl-2 font-bold text-lg mb-4">
                {section.title}
              </h3>

              <ul className="space-y-3 text-sm text-gray-200">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white transition"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="hover:text-white transition"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Separador */}
        <div className="border-t border-gray-700 my-10"></div>

        {/* Segunda fila: medios de pago */}
        <div>
          <h3 className="border-l-4 border-gray-400 pl-2 font-bold text-lg mb-5">
            Medios de pago
          </h3>

          <div className="flex flex-wrap items-center gap-8 text-gray-400 font-semibold text-xl">
            <span>Webpay</span>
            <span>Mercado Pago</span>
            <span>Santander</span>
            <span>BancoEstado</span>
          </div>
        </div>

        {/* Tercera fila: seguridad, dirección y redes */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border-2 border-gray-400 rounded-xl flex items-center justify-center">
              <EnvironmentOutlined className="text-2xl text-gray-300" />
            </div>

            <div>
              <p className="text-sm text-gray-400">Dirección</p>

              <p className="text-lg font-semibold">
                La Concepción 65, oficina 1003
              </p>

              <p className="text-sm text-gray-400">
                Providencia, Región Metropolitana
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <SafetyCertificateOutlined className="text-4xl text-gray-300" />

            <p className="text-sm text-gray-200">
              Econnet protege tu información con{" "}
              <strong>Secure Sockets Layer SSL</strong>
            </p>
          </div>

          <div className="lg:text-right">
            <div className="flex lg:justify-end gap-3 mb-4">
              <a
                href={redesSociales.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram Econnet"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer transition"
              >
                <InstagramOutlined />
              </a>

              <a
                href={redesSociales.tiktok}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok Econnet"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer transition"
              >
                <span className="text-xs font-black">TT</span>
              </a>

              <a
                href={redesSociales.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn Econnet"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 cursor-pointer transition"
              >
                <LinkedinFilled />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
          Copyright © 2026 Econnet.cl. Todos los derechos reservados.
        </div>
      </div>

      {/* Botón flotante: abre Instagram directamente */}
      <Link
        to="/contacto"
        className="fixed bottom-6 right-6 z-50 bg-gray-800 hover:bg-black text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 transition"
      >
        <CustomerServiceOutlined />
        <span className="font-semibold">¿Necesitas ayuda?</span>
      </Link>
    </footer>
  );
}

export default Footer;
