import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
from datetime import date

# ── Paleta Cyberpunk ─────────────────────────────────────────────────────────
BG_DARK    = "#0d0d1a"
BG_MID     = "#12122a"
BG_CARD    = "#1a1a3e"
NEON_PINK  = "#ff2d78"
NEON_CYAN  = "#00f5ff"
NEON_YELL  = "#f5e642"
NEON_PURP  = "#bf5fff"
NEON_GREEN = "#39ff14"
TEXT_MAIN  = "#e8e8ff"
TEXT_DIM   = "#7a7aaa"

FONT_TITLE = ("Courier New", 17, "bold")
FONT_LABEL = ("Courier New", 11)
FONT_BOLD  = ("Courier New", 11, "bold")
FONT_SMALL = ("Courier New", 10)
FONT_BIG   = ("Courier New", 22, "bold")

# ── Archivo de datos ─────────────────────────────────────────────────────────
ARCHIVO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datos_barberia.json")

def cargar_datos():
    if os.path.exists(ARCHIVO):
        with open(ARCHIVO, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "nombre_negocio": "CYBER CUTS",
        "barberos": ["Carlos", "Miguel", "Luis", "Roberto"],
        "servicios": [
            {"nombre": "Corte clasico",    "precio": 15},
            {"nombre": "Corte + barba",    "precio": 25},
            {"nombre": "Diseno de barba",  "precio": 12},
            {"nombre": "Tinte",            "precio": 35},
            {"nombre": "Afeitado clasico", "precio": 10},
        ],
        "clientes": [],
        "registros": [],
    }

def guardar_datos(datos):
    with open(ARCHIVO, "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)

# ── Helpers de widgets ────────────────────────────────────────────────────────
def neon_frame(parent, color=NEON_CYAN, **kwargs):
    outer = tk.Frame(parent, bg=color, padx=1, pady=1)
    inner = tk.Frame(outer, bg=BG_CARD, **kwargs)
    inner.pack(fill="both", expand=True)
    return outer, inner

def neon_button(parent, text, color=NEON_PINK, command=None, width=18):
    return tk.Button(
        parent, text=text, command=command,
        bg=BG_DARK, fg=color, font=FONT_BOLD,
        activebackground=color, activeforeground=BG_DARK,
        bd=0, relief="flat", cursor="hand2", width=width,
        highlightbackground=color, highlightthickness=1,
    )

def cyber_entry(parent, textvariable=None, width=26):
    return tk.Entry(
        parent, textvariable=textvariable, width=width,
        bg=BG_MID, fg=NEON_CYAN, font=FONT_LABEL,
        insertbackground=NEON_CYAN, bd=0,
        highlightbackground=NEON_CYAN, highlightthickness=1,
        relief="flat",
    )

# ════════════════════════════════════════════════════════════════════════════
class BarberiaApp:
    def __init__(self, root):
        self.root = root
        self.datos = cargar_datos()
        nombre = self.datos.get("nombre_negocio", "CYBER CUTS")
        self.root.title(f"[[ {nombre} ]] — Sistema de Gestion")
        self.root.geometry("980x660")
        self.root.configure(bg=BG_DARK)
        self.root.resizable(True, True)
        self._estilos_ttk()
        self._construir_ui()
        self.mostrar_inicio()

    # ── Estilos TTK ──────────────────────────────────────────────────────────
    def _estilos_ttk(self):
        s = ttk.Style()
        s.theme_use("clam")
        s.configure("Treeview",
            background=BG_MID, foreground=TEXT_MAIN,
            fieldbackground=BG_MID, rowheight=26,
            font=FONT_SMALL, borderwidth=0)
        s.configure("Treeview.Heading",
            background=BG_DARK, foreground=NEON_CYAN,
            font=FONT_BOLD, relief="flat")
        s.map("Treeview",
            background=[("selected", NEON_PINK)],
            foreground=[("selected", BG_DARK)])
        s.configure("Vertical.TScrollbar",
            background=BG_MID, troughcolor=BG_DARK,
            arrowcolor=NEON_CYAN, borderwidth=0)
        s.configure("TCombobox",
            fieldbackground=BG_MID, background=BG_MID,
            foreground=NEON_CYAN, selectbackground=NEON_PINK,
            arrowcolor=NEON_CYAN, font=FONT_LABEL)
        s.map("TCombobox",
            fieldbackground=[("readonly", BG_MID)],
            foreground=[("readonly", NEON_CYAN)])

    # ── Estructura principal ─────────────────────────────────────────────────
    def _construir_ui(self):
        # Header
        hdr = tk.Frame(self.root, bg=BG_DARK)
        hdr.pack(fill="x")
        tk.Frame(hdr, bg=NEON_PINK, height=2).pack(fill="x")
        hi = tk.Frame(hdr, bg=BG_DARK)
        hi.pack(fill="x", padx=16, pady=8)
        nombre = self.datos.get("nombre_negocio", "CYBER CUTS")
        tk.Label(hi, text=f"// {nombre} //",
            bg=BG_DARK, fg=NEON_PINK,
            font=("Courier New", 20, "bold")).pack(side="left")
        tk.Label(hi, text="SISTEMA DE GESTION v2.0",
            bg=BG_DARK, fg=NEON_CYAN,
            font=("Courier New", 11)).pack(side="left", padx=16)
        tk.Frame(hdr, bg=NEON_CYAN, height=1).pack(fill="x")

        # Body
        body = tk.Frame(self.root, bg=BG_DARK)
        body.pack(fill="both", expand=True)

        # Sidebar
        self.sidebar = tk.Frame(body, bg=BG_MID, width=190)
        self.sidebar.pack(side="left", fill="y")
        self.sidebar.pack_propagate(False)
        tk.Frame(self.sidebar, bg=NEON_PURP, width=2).pack(side="right", fill="y")

        tk.Label(self.sidebar, text="[ MENU ]",
            bg=BG_MID, fg=NEON_PURP,
            font=("Courier New", 10, "bold"), pady=12).pack(fill="x", padx=10)

        self._nav_btns = []
        nav = [
            (">> INICIO",       self.mostrar_inicio),
            (">> NUEVO CORTE",  self.mostrar_nuevo_corte),
            (">> HISTORIAL",    self.mostrar_historial),
            (">> CLIENTES",     self.mostrar_clientes),
            (">> INGRESOS",     self.mostrar_ingresos),
            (">> CONFIG",       self.mostrar_configurar),
        ]
        for label, cmd in nav:
            b = tk.Button(self.sidebar, text=label,
                bg=BG_MID, fg=TEXT_DIM,
                font=("Courier New", 11, "bold"),
                bd=0, relief="flat", cursor="hand2",
                pady=11, padx=12, anchor="w",
                activebackground=NEON_PURP, activeforeground=BG_DARK,
                command=cmd)
            b.pack(fill="x")
            self._nav_btns.append(b)

        # Area principal
        self.main = tk.Frame(body, bg=BG_DARK)
        self.main.pack(side="left", fill="both", expand=True)

    def _nav_sel(self, idx):
        for i, b in enumerate(self._nav_btns):
            b.configure(bg=NEON_PURP if i == idx else BG_MID,
                        fg=BG_DARK   if i == idx else TEXT_DIM)

    def _limpiar(self):
        for w in self.main.winfo_children():
            w.destroy()

    def _titulo(self, texto, color=NEON_CYAN):
        f = tk.Frame(self.main, bg=BG_DARK)
        f.pack(fill="x", padx=18, pady=(12, 4))
        tk.Label(f, text="[ " + texto.upper() + " ]",
            bg=BG_DARK, fg=color,
            font=("Courier New", 14, "bold")).pack(side="left")
        tk.Frame(f, bg=color, height=1).pack(
            side="left", fill="x", expand=True, padx=10, pady=8)

    # ════════════════════════════════════════════════════════════════════════
    # INICIO
    # ════════════════════════════════════════════════════════════════════════
    def mostrar_inicio(self):
        self._limpiar()
        self._nav_sel(0)
        self._titulo("Panel de hoy", NEON_PINK)

        hoy = str(date.today())
        reg_hoy = [r for r in self.datos["registros"] if r.get("fecha") == hoy]
        ing_hoy = sum(r.get("precio", 0) for r in reg_hoy)

        # Tarjetas
        row_c = tk.Frame(self.main, bg=BG_DARK)
        row_c.pack(fill="x", padx=18, pady=6)
        metrics = [
            ("CORTES HOY",  str(len(reg_hoy)),               NEON_PINK),
            ("INGRESOS",    f"${ing_hoy:.2f}",               NEON_GREEN),
            ("CLIENTES",    str(len(self.datos["clientes"])), NEON_CYAN),
            ("BARBEROS",    str(len(self.datos["barberos"])), NEON_YELL),
        ]
        for label, val, color in metrics:
            outer, card = neon_frame(row_c, color=color)
            outer.pack(side="left", padx=8, pady=4)
            tk.Label(card, text=label, bg=BG_CARD, fg=TEXT_DIM,
                font=FONT_SMALL, pady=4, padx=16).pack()
            tk.Label(card, text=val, bg=BG_CARD, fg=color,
                font=FONT_BIG, padx=16, pady=4).pack()

        self._titulo("Ultimos cortes del dia", NEON_CYAN)

        cols   = ("hora","cliente","barbero","servicio","precio")
        titulos= ["HORA","CLIENTE","BARBERO","SERVICIO","PRECIO"]
        anchos = [60, 150, 110, 160, 70]

        outer, ft = neon_frame(self.main, color=NEON_CYAN)
        outer.pack(padx=18, fill="x", pady=4)
        tree = ttk.Treeview(ft, columns=cols, show="headings", height=8)
        tree.tag_configure("odd",  background=BG_MID)
        tree.tag_configure("even", background=BG_CARD)
        for c, a, t in zip(cols, anchos, titulos):
            tree.heading(c, text=t)
            tree.column(c, width=a, anchor="center")
        tree.pack(fill="x", padx=2, pady=2)

        for i, r in enumerate(reversed(reg_hoy[-10:])):
            tag = "odd" if i % 2 == 0 else "even"
            tree.insert("", "end", tags=(tag,), values=(
                r.get("hora",""), r.get("cliente",""),
                r.get("barbero",""), r.get("servicio",""),
                f'${r.get("precio",0)}'
            ))

    # ════════════════════════════════════════════════════════════════════════
    # NUEVO CORTE
    # ════════════════════════════════════════════════════════════════════════
    def mostrar_nuevo_corte(self):
        self._limpiar()
        self._nav_sel(1)
        self._titulo("Registrar nuevo corte", NEON_GREEN)

        outer, form = neon_frame(self.main, color=NEON_GREEN)
        outer.pack(padx=28, pady=8, fill="x")

        def fila(txt, row, color=NEON_CYAN):
            tk.Label(form, text=txt, bg=BG_CARD, fg=color,
                font=FONT_BOLD, anchor="w", padx=12, pady=8
                ).grid(row=row, column=0, sticky="w")

        fila(">> CLIENTE:", 0, NEON_CYAN)
        self.var_cliente = tk.StringVar()
        nombres = [c["nombre"] for c in self.datos["clientes"]]
        cb_cli = ttk.Combobox(form, textvariable=self.var_cliente,
            values=nombres, width=26)
        cb_cli.grid(row=0, column=1, padx=10, pady=8, sticky="w")
        neon_button(form, "+ NUEVO CLIENTE", NEON_YELL,
            self._popup_nuevo_cliente, 16
            ).grid(row=0, column=2, padx=6)

        fila(">> BARBERO:", 1, NEON_PINK)
        self.var_barbero = tk.StringVar()
        ttk.Combobox(form, textvariable=self.var_barbero,
            values=self.datos["barberos"], width=26
            ).grid(row=1, column=1, padx=10, pady=8, sticky="w")

        fila(">> SERVICIO:", 2, NEON_PURP)
        self.var_servicio = tk.StringVar()
        cb_srv = ttk.Combobox(form, textvariable=self.var_servicio,
            values=[s["nombre"] for s in self.datos["servicios"]], width=26)
        cb_srv.grid(row=2, column=1, padx=10, pady=8, sticky="w")

        fila(">> PRECIO ($):", 3, NEON_GREEN)
        self.var_precio = tk.StringVar()
        cyber_entry(form, self.var_precio, 14).grid(
            row=3, column=1, padx=10, pady=8, sticky="w")

        def auto_precio(e=None):
            for s in self.datos["servicios"]:
                if s["nombre"] == self.var_servicio.get():
                    self.var_precio.set(str(s["precio"])); break
        cb_srv.bind("<<ComboboxSelected>>", auto_precio)

        fila(">> NOTAS:", 4, TEXT_DIM)
        self.txt_notas = tk.Text(form, width=28, height=3,
            bg=BG_MID, fg=NEON_CYAN, font=FONT_LABEL,
            insertbackground=NEON_CYAN, bd=0,
            highlightbackground=NEON_CYAN, highlightthickness=1)
        self.txt_notas.grid(row=4, column=1, padx=10, pady=8, sticky="w")

        def guardar():
            from datetime import datetime
            cliente  = self.var_cliente.get().strip()
            barbero  = self.var_barbero.get().strip()
            servicio = self.var_servicio.get().strip()
            notas    = self.txt_notas.get("1.0", "end").strip()
            if not cliente or not barbero or not servicio:
                messagebox.showwarning("ERROR", "Completa cliente, barbero y servicio.")
                return
            try:
                precio = float(self.var_precio.get()) if self.var_precio.get() else 0
            except ValueError:
                messagebox.showerror("ERROR", "El precio debe ser un numero.")
                return
            ahora = datetime.now()
            self.datos["registros"].append({
                "fecha": str(ahora.date()), "hora": ahora.strftime("%H:%M"),
                "cliente": cliente, "barbero": barbero,
                "servicio": servicio, "precio": precio, "notas": notas,
            })
            if cliente not in [c["nombre"] for c in self.datos["clientes"]]:
                self.datos["clientes"].append({"nombre": cliente, "telefono": ""})
            guardar_datos(self.datos)
            messagebox.showinfo("REGISTRADO", f"Corte guardado para {cliente}.")
            self.mostrar_inicio()

        tk.Button(self.main, text="[[ GUARDAR CORTE ]]",
            bg=NEON_GREEN, fg=BG_DARK,
            font=("Courier New", 13, "bold"),
            bd=0, padx=22, pady=10, cursor="hand2",
            activebackground=NEON_CYAN, activeforeground=BG_DARK,
            command=guardar).pack(pady=14)

    def _popup_nuevo_cliente(self):
        pop = tk.Toplevel(self.root)
        pop.title("NUEVO CLIENTE")
        pop.geometry("340x175")
        pop.configure(bg=BG_DARK)
        tk.Frame(pop, bg=NEON_PINK, height=2).pack(fill="x")

        tk.Label(pop, text="NOMBRE:", bg=BG_DARK, fg=NEON_CYAN,
            font=FONT_BOLD).grid(row=0, column=0, padx=14, pady=10, sticky="w")
        e_nom = cyber_entry(pop, width=20)
        e_nom.grid(row=0, column=1, padx=10, pady=10)

        tk.Label(pop, text="TELEFONO:", bg=BG_DARK, fg=NEON_CYAN,
            font=FONT_BOLD).grid(row=1, column=0, padx=14, pady=6, sticky="w")
        e_tel = cyber_entry(pop, width=20)
        e_tel.grid(row=1, column=1, padx=10, pady=6)

        def agregar():
            nombre = e_nom.get().strip()
            if not nombre: return
            self.datos["clientes"].append({
                "nombre": nombre, "telefono": e_tel.get().strip()})
            guardar_datos(self.datos)
            self.var_cliente.set(nombre)
            pop.destroy()

        neon_button(pop, "[ AGREGAR ]", NEON_GREEN, agregar, 22
            ).grid(row=2, column=0, columnspan=2, pady=10)

    # ════════════════════════════════════════════════════════════════════════
    # HISTORIAL
    # ════════════════════════════════════════════════════════════════════════
    def mostrar_historial(self):
        self._limpiar()
        self._nav_sel(2)
        self._titulo("Historial de cortes", NEON_YELL)

        ff = tk.Frame(self.main, bg=BG_DARK)
        ff.pack(padx=18, pady=4, fill="x")
        tk.Label(ff, text="FILTRAR BARBERO:", bg=BG_DARK,
            fg=NEON_CYAN, font=FONT_BOLD).pack(side="left")
        var_f = tk.StringVar(value="Todos")
        cb_f = ttk.Combobox(ff, textvariable=var_f,
            values=["Todos"] + self.datos["barberos"], width=16)
        cb_f.pack(side="left", padx=8)

        outer, ft = neon_frame(self.main, color=NEON_YELL)
        outer.pack(padx=18, fill="both", expand=True, pady=4)

        cols  = ("fecha","hora","cliente","barbero","servicio","precio","notas")
        tits  = ["FECHA","HORA","CLIENTE","BARBERO","SERVICIO","PRECIO","NOTAS"]
        anchs = [88, 58, 140, 100, 140, 62, 150]

        scroll = ttk.Scrollbar(ft, orient="vertical")
        tree = ttk.Treeview(ft, columns=cols, show="headings",
            yscrollcommand=scroll.set)
        scroll.config(command=tree.yview)
        scroll.pack(side="right", fill="y")
        tree.pack(fill="both", expand=True, padx=2, pady=2)
        tree.tag_configure("odd",  background=BG_MID)
        tree.tag_configure("even", background=BG_CARD)
        for c, a, t in zip(cols, anchs, tits):
            tree.heading(c, text=t)
            tree.column(c, width=a, anchor="center")

        def cargar(filtro="Todos"):
            tree.delete(*tree.get_children())
            for i, r in enumerate(reversed(self.datos["registros"])):
                if filtro != "Todos" and r.get("barbero") != filtro:
                    continue
                tag = "odd" if i % 2 == 0 else "even"
                tree.insert("", "end", tags=(tag,), values=(
                    r.get("fecha",""), r.get("hora",""),
                    r.get("cliente",""), r.get("barbero",""),
                    r.get("servicio",""), f'${r.get("precio",0)}',
                    r.get("notas","")
                ))
        cb_f.bind("<<ComboboxSelected>>", lambda e: cargar(var_f.get()))
        cargar()

    # ════════════════════════════════════════════════════════════════════════
    # CLIENTES
    # ════════════════════════════════════════════════════════════════════════
    def mostrar_clientes(self):
        self._limpiar()
        self._nav_sel(3)
        self._titulo("Clientes registrados", NEON_CYAN)

        outer, ft = neon_frame(self.main, color=NEON_CYAN)
        outer.pack(padx=18, fill="both", expand=True, pady=8)

        cols  = ("nombre","telefono","visitas","ultimo")
        tits  = ["NOMBRE","TELEFONO","VISITAS","ULTIMO SERVICIO"]
        anchs = [200, 140, 80, 200]

        scroll = ttk.Scrollbar(ft, orient="vertical")
        tree = ttk.Treeview(ft, columns=cols, show="headings",
            yscrollcommand=scroll.set, height=16)
        scroll.config(command=tree.yview)
        scroll.pack(side="right", fill="y")
        tree.pack(fill="both", expand=True, padx=2, pady=2)
        tree.tag_configure("odd",  background=BG_MID)
        tree.tag_configure("even", background=BG_CARD)
        for c, a, t in zip(cols, anchs, tits):
            tree.heading(c, text=t)
            tree.column(c, width=a, anchor="center")

        for i, c in enumerate(self.datos["clientes"]):
            nombre = c["nombre"]
            vis = sum(1 for r in self.datos["registros"]
                if r.get("cliente") == nombre)
            ult_r = [r for r in self.datos["registros"]
                if r.get("cliente") == nombre]
            ult = ult_r[-1].get("servicio","---") if ult_r else "---"
            tag = "odd" if i % 2 == 0 else "even"
            tree.insert("", "end", tags=(tag,),
                values=(nombre, c.get("telefono",""), vis, ult))

    # ════════════════════════════════════════════════════════════════════════
    # INGRESOS
    # ════════════════════════════════════════════════════════════════════════
    def mostrar_ingresos(self):
        self._limpiar()
        self._nav_sel(4)
        self._titulo("Resumen de ingresos", NEON_GREEN)

        hoy = str(date.today())
        sem = date.today().isocalendar()[1]

        def tot(fn):
            return sum(r.get("precio",0) for r in self.datos["registros"] if fn(r))

        t_hoy = tot(lambda r: r.get("fecha") == hoy)
        t_sem = tot(lambda r: date.fromisoformat(r["fecha"]).isocalendar()[1] == sem
                    if r.get("fecha") else False)
        t_mes = tot(lambda r: r.get("fecha","")[:7] == hoy[:7])
        t_tot = tot(lambda r: True)

        row = tk.Frame(self.main, bg=BG_DARK)
        row.pack(padx=18, pady=8, fill="x")
        for label, val, color in [
            ("HOY",    f"${t_hoy:.2f}",  NEON_PINK),
            ("SEMANA", f"${t_sem:.2f}",  NEON_CYAN),
            ("MES",    f"${t_mes:.2f}",  NEON_YELL),
            ("TOTAL",  f"${t_tot:.2f}",  NEON_GREEN),
        ]:
            outer, card = neon_frame(row, color=color)
            outer.pack(side="left", padx=8, pady=4)
            tk.Label(card, text=label, bg=BG_CARD, fg=TEXT_DIM,
                font=FONT_SMALL, padx=18, pady=4).pack()
            tk.Label(card, text=val, bg=BG_CARD, fg=color,
                font=FONT_BIG, padx=18, pady=4).pack()

        self._titulo("Por barbero", NEON_PURP)
        outer, ft = neon_frame(self.main, color=NEON_PURP)
        outer.pack(padx=18, fill="x", pady=4)

        cols = ("barbero","cortes","ingresos")
        tree = ttk.Treeview(ft, columns=cols, show="headings", height=6)
        tree.tag_configure("odd",  background=BG_MID)
        tree.tag_configure("even", background=BG_CARD)
        for c, a, t in zip(cols,[220,100,160],["BARBERO","CORTES","INGRESOS"]):
            tree.heading(c, text=t)
            tree.column(c, width=a, anchor="center")
        tree.pack(fill="x", padx=2, pady=2)

        for i, b in enumerate(self.datos["barberos"]):
            rb  = [r for r in self.datos["registros"] if r.get("barbero") == b]
            ing = sum(r.get("precio",0) for r in rb)
            tag = "odd" if i % 2 == 0 else "even"
            tree.insert("","end",tags=(tag,),
                values=(b, len(rb), f"${ing:.2f}"))

    # ════════════════════════════════════════════════════════════════════════
    # CONFIGURAR
    # ════════════════════════════════════════════════════════════════════════
    def mostrar_configurar(self):
        self._limpiar()
        self._nav_sel(5)
        self._titulo("Configuracion", NEON_PURP)

        # Nombre negocio
        fn = tk.Frame(self.main, bg=BG_DARK)
        fn.pack(padx=18, pady=4, fill="x")
        tk.Label(fn, text="NOMBRE DEL NEGOCIO:", bg=BG_DARK,
            fg=NEON_PURP, font=FONT_BOLD).pack(side="left")
        var_nom = tk.StringVar(value=self.datos.get("nombre_negocio","CYBER CUTS"))
        e_nom = cyber_entry(fn, var_nom, 22)
        e_nom.pack(side="left", padx=8)
        def guardar_nombre():
            self.datos["nombre_negocio"] = var_nom.get().strip()
            guardar_datos(self.datos)
            self.root.title(f"[[ {self.datos['nombre_negocio']} ]] — Sistema de Gestion")
            messagebox.showinfo("OK", "Nombre actualizado.")
        neon_button(fn, "GUARDAR", NEON_PURP, guardar_nombre, 10).pack(side="left", padx=4)

        # Barberos
        self._titulo("Barberos", NEON_PINK)
        fb = tk.Frame(self.main, bg=BG_DARK)
        fb.pack(padx=18, pady=4, fill="x")

        outer_b, _ = neon_frame(fb, NEON_PINK)
        outer_b.pack(side="left")
        lb = tk.Listbox(outer_b, bg=BG_MID, fg=NEON_CYAN,
            font=FONT_LABEL, height=5, width=24,
            selectbackground=NEON_PINK, selectforeground=BG_DARK,
            bd=0, highlightthickness=0)
        lb.pack(padx=1, pady=1)
        for b in self.datos["barberos"]:
            lb.insert("end", b)

        fb2 = tk.Frame(fb, bg=BG_DARK)
        fb2.pack(side="left", padx=12)
        e_b = cyber_entry(fb2, width=18)
        e_b.pack(pady=4)

        def add_b():
            n = e_b.get().strip()
            if n and n not in self.datos["barberos"]:
                self.datos["barberos"].append(n)
                lb.insert("end", n)
                guardar_datos(self.datos)
                e_b.delete(0,"end")
        def del_b():
            sel = lb.curselection()
            if sel:
                n = lb.get(sel[0])
                self.datos["barberos"].remove(n)
                lb.delete(sel[0])
                guardar_datos(self.datos)

        neon_button(fb2,"[ + AGREGAR ]",NEON_GREEN,add_b,14).pack(fill="x",pady=2)
        neon_button(fb2,"[ - ELIMINAR ]",NEON_PINK,del_b,14).pack(fill="x",pady=2)

        # Servicios
        self._titulo("Servicios y precios", NEON_CYAN)
        fs = tk.Frame(self.main, bg=BG_DARK)
        fs.pack(padx=18, pady=4, fill="x")

        outer_s, ft_s = neon_frame(fs, NEON_CYAN)
        outer_s.pack(side="left")
        tree_s = ttk.Treeview(ft_s, columns=("nombre","precio"),
            show="headings", height=5)
        tree_s.heading("nombre", text="SERVICIO")
        tree_s.heading("precio", text="PRECIO")
        tree_s.column("nombre", width=200)
        tree_s.column("precio", width=90, anchor="center")
        tree_s.pack(padx=1, pady=1)
        tree_s.tag_configure("odd",  background=BG_MID)
        tree_s.tag_configure("even", background=BG_CARD)
        for i, s in enumerate(self.datos["servicios"]):
            tag = "odd" if i%2==0 else "even"
            tree_s.insert("","end",tags=(tag,),values=(s["nombre"],f'${s["precio"]}'))

        fs2 = tk.Frame(fs, bg=BG_DARK)
        fs2.pack(side="left", padx=12)
        tk.Label(fs2,text="NOMBRE:",bg=BG_DARK,fg=NEON_CYAN,font=FONT_SMALL).pack(anchor="w")
        e_sn = cyber_entry(fs2, width=18); e_sn.pack(pady=2)
        tk.Label(fs2,text="PRECIO ($):",bg=BG_DARK,fg=NEON_GREEN,font=FONT_SMALL).pack(anchor="w")
        e_sp = cyber_entry(fs2, width=10); e_sp.pack(pady=2)

        def add_s():
            n = e_sn.get().strip()
            try: p = float(e_sp.get().strip())
            except: messagebox.showerror("ERROR","Precio invalido."); return
            if n:
                self.datos["servicios"].append({"nombre":n,"precio":p})
                i = len(tree_s.get_children())
                tag = "odd" if i%2==0 else "even"
                tree_s.insert("","end",tags=(tag,),values=(n,f'${p}'))
                guardar_datos(self.datos)
                e_sn.delete(0,"end"); e_sp.delete(0,"end")

        def del_s():
            sel = tree_s.selection()
            if sel:
                v = tree_s.item(sel[0])["values"]
                self.datos["servicios"] = [
                    s for s in self.datos["servicios"] if s["nombre"] != v[0]]
                tree_s.delete(sel[0])
                guardar_datos(self.datos)

        neon_button(fs2,"[ + AGREGAR ]",NEON_GREEN,add_s,14).pack(fill="x",pady=2)
        neon_button(fs2,"[ - ELIMINAR ]",NEON_PINK,del_s,14).pack(fill="x",pady=2)

# ════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    root = tk.Tk()
    app = BarberiaApp(root)
    root.mainloop()
