#!/usr/bin/env python3
"""
Genera los iconos PNG de la PWA y la portada Open Graph sin dependencias
externas (solo zlib/struct de la librería estándar).

Son marcadores de posición geométricos: un cuadrado verde redondeado con el
número 1. Cuando tengas el logotipo definitivo, reemplaza los archivos de
assets/img/ y borra este script o ajústalo.

Uso:  python3 tools/generar_iconos.py
"""

import struct
import zlib
from pathlib import Path

VERDE = (0, 155, 58)
VERDE_OSCURO = (0, 107, 44)
BLANCO = (255, 255, 255)

SALIDA = Path(__file__).resolve().parent.parent / "assets" / "img"


def lienzo(w, h, color):
    return [[color for _ in range(w)] for _ in range(h)]


def rect(px, x0, y0, x1, y1, color):
    h, w = len(px), len(px[0])
    for y in range(max(0, int(y0)), min(h, int(y1))):
        fila = px[y]
        for x in range(max(0, int(x0)), min(w, int(x1))):
            fila[x] = color


def rect_redondeado(px, x0, y0, x1, y1, r, color):
    h, w = len(px), len(px[0])
    for y in range(max(0, int(y0)), min(h, int(y1))):
        for x in range(max(0, int(x0)), min(w, int(x1))):
            dx = min(x - x0, x1 - 1 - x)
            dy = min(y - y0, y1 - 1 - y)
            if dx < r and dy < r:
                if (r - dx) ** 2 + (r - dy) ** 2 > r * r:
                    continue
            px[y][x] = color


def numero_uno(px, cx, cy, alto, color):
    """Dibuja un '1' sencillo a base de rectángulos."""
    grosor = max(2, int(alto * 0.16))
    rect(px, cx - grosor / 2, cy - alto / 2, cx + grosor / 2, cy + alto / 2, color)
    # bandera superior
    rect(px, cx - alto * 0.26, cy - alto / 2, cx - grosor / 2, cy - alto / 2 + grosor, color)
    # base
    rect(px, cx - alto * 0.30, cy + alto / 2 - grosor, cx + alto * 0.30, cy + alto / 2, color)


def escribir_png(ruta, px):
    h, w = len(px), len(px[0])
    crudo = b"".join(
        b"\x00" + b"".join(struct.pack("3B", *px[y][x]) for x in range(w)) for y in range(h)
    )

    def trozo(tipo, datos):
        c = tipo + datos
        return struct.pack(">I", len(datos)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    png = (
        b"\x89PNG\r\n\x1a\n"
        + trozo(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
        + trozo(b"IDAT", zlib.compress(crudo, 9))
        + trozo(b"IEND", b"")
    )
    ruta.write_bytes(png)
    print(f"  {ruta.relative_to(SALIDA.parent.parent)}  ({w}x{h}, {len(png)} bytes)")


def icono(tamano):
    px = lienzo(tamano, tamano, VERDE)
    margen = tamano * 0.10
    rect_redondeado(px, margen, margen, tamano - margen, tamano - margen,
                    tamano * 0.22, VERDE)
    numero_uno(px, tamano / 2, tamano / 2, tamano * 0.46, BLANCO)
    return px


def portada(w=1200, h=630):
    px = lienzo(w, h, VERDE_OSCURO)
    # degradado vertical hacia el verde de marca
    for y in range(h):
        t = y / h
        color = tuple(
            int(VERDE_OSCURO[i] + (VERDE[i] - VERDE_OSCURO[i]) * (t ** 1.6)) for i in range(3)
        )
        for x in range(w):
            px[y][x] = color
    # riel horizontal con estaciones
    riel_y = int(h * 0.74)
    rect(px, w * 0.08, riel_y - 4, w * 0.92, riel_y + 4, BLANCO)
    for i in range(9):
        cx = w * 0.08 + (w * 0.84) * i / 8
        rect_redondeado(px, cx - 11, riel_y - 11, cx + 11, riel_y + 11, 11, BLANCO)
    numero_uno(px, w * 0.5, h * 0.36, h * 0.40, BLANCO)
    return px


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    print("Generando marcadores de posición en assets/img/ …")
    for t in (192, 512):
        escribir_png(SALIDA / f"icon-{t}.png", icono(t))
    escribir_png(SALIDA / "og-cover.png", portada())
    print("Listo. Reemplázalos por los definitivos cuando los tengas.")
