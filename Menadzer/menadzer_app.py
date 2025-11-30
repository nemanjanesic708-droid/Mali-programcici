import json
import os
import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime

PODACI_FAJL = "klijenti_podaci.json"

class MenazerKlijenata:
    def __init__(self):
        self.klijenti = self.ucitaj_podatke()
    
    def ucitaj_podatke(self):
        if os.path.exists(PODACI_FAJL):
            try:
                with open(PODACI_FAJL, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data if isinstance(data, dict) else {}
            except:
                return {}
        return {}
    
    def sacuvaj_podatke(self):
        try:
            with open(PODACI_FAJL, 'w', encoding='utf-8') as f:
                json.dump(self.klijenti, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Greška pri čuvanju: {e}")
            return False
    
    def dodaj_klijenta(self, ime, prezime, email, telefon):
        try:
            max_id = 0
            for k_id in self.klijenti.keys():
                try:
                    if int(k_id) > max_id:
                        max_id = int(k_id)
                except:
                    pass
            
            id_klijenta = str(max_id + 1)
            self.klijenti[id_klijenta] = {
                "ime": ime,
                "prezime": prezime,
                "email": email,
                "telefon": telefon,
                "paketi": [],
                "beleske": []
            }
            self.sacuvaj_podatke()
            return id_klijenta
        except Exception as e:
            print(f"Greška pri dodavanju: {e}")
            return None
    
    def dodeli_paket(self, id_klijenta, naziv_paketa, cena, datum_pocetka):
        if id_klijenta not in self.klijenti:
            return False
        
        paket = {
            "naziv": naziv_paketa,
            "cena": cena,
            "datum_pocetka": datum_pocetka,
            "datum_dodele": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        self.klijenti[id_klijenta]["paketi"].append(paket)
        self.sacuvaj_podatke()
        return True
    
    def dodaj_beleszku(self, id_klijenta, tekst_beleske):
        if id_klijenta not in self.klijenti:
            return False
        
        beleszka = {
            "tekst": tekst_beleske,
            "datum": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        self.klijenti[id_klijenta]["beleske"].append(beleszka)
        self.sacuvaj_podatke()
        return True
    
    def obrisi_klijenta(self, id_klijenta):
        if id_klijenta in self.klijenti:
            del self.klijenti[id_klijenta]
            self.sacuvaj_podatke()
            return True
        return False

class GUIApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Menadžer Klijenata")
        self.root.geometry("1200x700")
        self.root.configure(bg='#ecf0f1')
        
        self.menadzer = MenazerKlijenata()
        
        # Moderan stil
        self.setup_style()
        
        # Glavni frame
        self.main_frame = ttk.Frame(root)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=0, pady=0)
        
        # Header
        self.setup_header()
        
        # Glavni sadržaj
        self.setup_content()
        
        # Učitaj klijente
        self.ucitaj_klijente()
    
    def setup_style(self):
        style = ttk.Style()
        style.theme_use('clam')
        
        style.configure('Title.TLabel', font=('Segoe UI', 20, 'bold'), background='#3498db', foreground='white')
        style.configure('Header.TFrame', background='#3498db')
        style.configure('Main.TFrame', background='#ecf0f1')
        style.configure('TLabel', background='#ecf0f1', foreground='#2c3e50', font=('Segoe UI', 10))
        style.configure('TEntry', font=('Segoe UI', 10), padding=5)
        style.configure('Treeview', font=('Segoe UI', 9), rowheight=30, background='white', foreground='#2c3e50')
        style.configure('Treeview.Heading', font=('Segoe UI', 10, 'bold'), background='#34495e', foreground='white')
    
    def setup_header(self):
        header_frame = ttk.Frame(self.main_frame, style='Header.TFrame')
        header_frame.pack(fill=tk.X, padx=0, pady=0)
        
        title_frame = ttk.Frame(header_frame, style='Header.TFrame')
        title_frame.pack(fill=tk.X, padx=20, pady=15)
        
        title_label = ttk.Label(title_frame, text="👥 MENADŽER KLIJENATA", style='Title.TLabel', 
                               background='#3498db', foreground='white', font=('Segoe UI', 20, 'bold'))
        title_label.pack(anchor=tk.W)
    
    def setup_content(self):
        content_frame = ttk.Frame(self.main_frame, style='Main.TFrame')
        content_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        # Dugmići
        button_frame = ttk.Frame(content_frame, style='Main.TFrame')
        button_frame.pack(fill=tk.X, pady=(0, 15))
        
        buttons_data = [
            ("➕ Dodaj Klijenta", self.dodaj_klijenta_dijalog, '#27ae60'),
            ("📦 Dodeli Paket", self.dodeli_paket_dijalog, '#3498db'),
            ("📝 Dodaj Belešku", self.dodaj_beleszku_dijalog, '#f39c12'),
            ("🗑️ Obriši", self.obrisi_klijenta_dijalog, '#e74c3c'),
            ("🔄 Osveži", self.ucitaj_klijente, '#34495e'),
        ]
        
        for text, command, color in buttons_data:
            btn = tk.Button(button_frame, text=text, command=command, 
                           font=('Segoe UI', 10, 'bold'), 
                           bg=color, fg='white', 
                           padx=15, pady=10, 
                           border=0, cursor='hand2',
                           activebackground=self.darker_color(color))
            btn.pack(side=tk.LEFT, padx=5)
        
        # Tabela
        tree_frame = ttk.Frame(content_frame, style='Main.TFrame')
        tree_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 15))
        
        scrollbar = ttk.Scrollbar(tree_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.tree = ttk.Treeview(tree_frame, 
                                columns=('ID', 'Ime', 'Prezime', 'Email', 'Telefon', 'Paketi', 'Beleške'),
                                height=20, yscrollcommand=scrollbar.set, style='Treeview')
        scrollbar.config(command=self.tree.yview)
        
        self.tree.column('#0', width=0, stretch=tk.NO)
        self.tree.column('ID', anchor=tk.CENTER, width=50)
        self.tree.column('Ime', anchor=tk.W, width=130)
        self.tree.column('Prezime', anchor=tk.W, width=130)
        self.tree.column('Email', anchor=tk.W, width=200)
        self.tree.column('Telefon', anchor=tk.W, width=120)
        self.tree.column('Paketi', anchor=tk.CENTER, width=80)
        self.tree.column('Beleške', anchor=tk.CENTER, width=80)
        
        for col in self.tree['columns']:
            self.tree.heading(col, text=col)
        
        self.tree.pack(fill=tk.BOTH, expand=True)
        
        # Dugme za pregled
        detail_btn = tk.Button(content_frame, text="👁️ Detaljni Pregled Klijenta", 
                              command=self.detaljni_pregled,
                              font=('Segoe UI', 10, 'bold'),
                              bg='#9b59b6', fg='white',
                              padx=15, pady=10,
                              border=0, cursor='hand2',
                              activebackground='#8e44ad')
        detail_btn.pack(side=tk.LEFT, padx=5)
    
    def darker_color(self, hex_color):
        hex_color = hex_color.lstrip('#')
        return '#' + ''.join([hex(max(0, int(hex_color[i:i+2], 16) - 30))[2:].zfill(2) for i in (0, 2, 4)])
    
    def ucitaj_klijente(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        for id_klijenta in sorted(self.menadzer.klijenti.keys(), key=lambda x: int(x) if x.isdigit() else 0):
            klijent = self.menadzer.klijenti[id_klijenta]
            self.tree.insert('', tk.END, text='',
                           values=(id_klijenta, klijent['ime'], klijent['prezime'],
                                 klijent['email'], klijent['telefon'],
                                 len(klijent['paketi']), len(klijent['beleske'])))
    
    def dodaj_klijenta_dijalog(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("Dodaj Novog Klijenta")
        dialog.geometry("500x500")
        dialog.transient(self.root)
        dialog.grab_set()
        dialog.resizable(False, False)
        dialog.configure(bg='#ecf0f1')
        
        # Zaglavlje
        header = tk.Frame(dialog, bg='#3498db', height=50)
        header.pack(fill=tk.X)
        tk.Label(header, text="➕ Dodaj Novog Klijenta", font=('Segoe UI', 14, 'bold'), 
                bg='#3498db', fg='white').pack(pady=10)
        
        # Forma
        form_frame = tk.Frame(dialog, bg='#ecf0f1')
        form_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        fields = [
            ("Ime:", "ime"),
            ("Prezime:", "prezime"),
            ("Email:", "email"),
            ("Telefon:", "telefon")
        ]
        
        entries = {}
        for label_text, field_name in fields:
            label = tk.Label(form_frame, text=label_text, font=('Segoe UI', 10, 'bold'), 
                           bg='#ecf0f1', fg='#2c3e50')
            label.pack(anchor=tk.W, pady=(10, 3))
            
            entry = tk.Entry(form_frame, font=('Segoe UI', 10), width=40)
            entry.pack(anchor=tk.W, ipady=8)
            entries[field_name] = entry
        
        entries['ime'].focus()
        
        def sačuvaj():
            ime = entries['ime'].get().strip()
            prezime = entries['prezime'].get().strip()
            email = entries['email'].get().strip()
            telefon = entries['telefon'].get().strip()
            
            if not ime or not prezime or not email:
                messagebox.showerror("Greška", "Molim unesi: Ime, Prezime i Email!")
                return
            
            id_klijenta = self.menadzer.dodaj_klijenta(ime, prezime, email, telefon)
            if id_klijenta:
                messagebox.showinfo("Uspeh", f"✓ Klijent {ime} {prezime} je uspešno dodat!")
                self.ucitaj_klijente()
                dialog.destroy()
            else:
                messagebox.showerror("Greška", "Greška pri dodavanju klijenta!")
        
        # Dugmići
        btn_frame = tk.Frame(form_frame, bg='#ecf0f1')
        btn_frame.pack(fill=tk.X, pady=(30, 0))
        
        save_btn = tk.Button(btn_frame, text="✓ Sačuvaj", command=sačuvaj,
                            font=('Segoe UI', 10, 'bold'), bg='#27ae60', fg='white',
                            padx=20, pady=8, border=0, cursor='hand2',
                            activebackground='#229954')
        save_btn.pack(side=tk.LEFT, padx=5)
        
        cancel_btn = tk.Button(btn_frame, text="✕ Otkaži", command=dialog.destroy,
                              font=('Segoe UI', 10, 'bold'), bg='#e74c3c', fg='white',
                              padx=20, pady=8, border=0, cursor='hand2',
                              activebackground='#cb4335')
        cancel_btn.pack(side=tk.LEFT, padx=5)
    
    def dodeli_paket_dijalog(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showerror("Greška", "Molim odaberi klijenta!")
            return
        
        id_klijenta = self.tree.item(selected[0])['values'][0]
        ime = self.tree.item(selected[0])['values'][1]
        prezime = self.tree.item(selected[0])['values'][2]
        
        dialog = tk.Toplevel(self.root)
        dialog.title(f"Dodeli Paket - {ime} {prezime}")
        dialog.geometry("500x500")
        dialog.transient(self.root)
        dialog.grab_set()
        dialog.resizable(False, False)
        dialog.configure(bg='#ecf0f1')
        
        # Zaglavlje
        header = tk.Frame(dialog, bg='#3498db', height=50)
        header.pack(fill=tk.X)
        tk.Label(header, text="📦 Dodeli Paket Proizvoda", font=('Segoe UI', 14, 'bold'), 
                bg='#3498db', fg='white').pack(pady=10)
        
        # Forma
        form_frame = tk.Frame(dialog, bg='#ecf0f1')
        form_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        fields = [
            ("Naziv Paketa:", "naziv"),
            ("Cena (dinara):", "cena"),
            ("Datum Početka (YYYY-MM-DD):", "datum")
        ]
        
        entries = {}
        for label_text, field_name in fields:
            label = tk.Label(form_frame, text=label_text, font=('Segoe UI', 10, 'bold'), 
                           bg='#ecf0f1', fg='#2c3e50')
            label.pack(anchor=tk.W, pady=(10, 3))
            
            entry = tk.Entry(form_frame, font=('Segoe UI', 10), width=40)
            entry.pack(anchor=tk.W, ipady=8)
            entries[field_name] = entry
        
        entries['datum'].insert(0, datetime.now().strftime("%Y-%m-%d"))
        entries['naziv'].focus()
        
        def sačuvaj():
            naziv = entries['naziv'].get().strip()
            cena = entries['cena'].get().strip()
            datum = entries['datum'].get().strip()
            
            if not naziv or not cena:
                messagebox.showerror("Greška", "Molim unesi Naziv i Cenu!")
                return
            
            if self.menadzer.dodeli_paket(id_klijenta, naziv, cena, datum):
                messagebox.showinfo("Uspeh", f"✓ Paket je uspešno dodeljen!")
                self.ucitaj_klijente()
                dialog.destroy()
        
        # Dugmići
        btn_frame = tk.Frame(form_frame, bg='#ecf0f1')
        btn_frame.pack(fill=tk.X, pady=(30, 0))
        
        save_btn = tk.Button(btn_frame, text="✓ Sačuvaj", command=sačuvaj,
                            font=('Segoe UI', 10, 'bold'), bg='#27ae60', fg='white',
                            padx=20, pady=8, border=0, cursor='hand2',
                            activebackground='#229954')
        save_btn.pack(side=tk.LEFT, padx=5)
        
        cancel_btn = tk.Button(btn_frame, text="✕ Otkaži", command=dialog.destroy,
                              font=('Segoe UI', 10, 'bold'), bg='#e74c3c', fg='white',
                              padx=20, pady=8, border=0, cursor='hand2',
                              activebackground='#cb4335')
        cancel_btn.pack(side=tk.LEFT, padx=5)
    
    def dodaj_beleszku_dijalog(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showerror("Greška", "Molim odaberi klijenta!")
            return
        
        id_klijenta = self.tree.item(selected[0])['values'][0]
        ime = self.tree.item(selected[0])['values'][1]
        prezime = self.tree.item(selected[0])['values'][2]
        
        dialog = tk.Toplevel(self.root)
        dialog.title(f"Dodaj Belešku - {ime} {prezime}")
        dialog.geometry("500x500")
        dialog.transient(self.root)
        dialog.grab_set()
        dialog.resizable(False, False)
        dialog.configure(bg='#ecf0f1')
        
        # Zaglavlje
        header = tk.Frame(dialog, bg='#3498db', height=50)
        header.pack(fill=tk.X)
        tk.Label(header, text="📝 Dodaj Belešku", font=('Segoe UI', 14, 'bold'), 
                bg='#3498db', fg='white').pack(pady=10)
        
        # Forma
        form_frame = tk.Frame(dialog, bg='#ecf0f1')
        form_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        label = tk.Label(form_frame, text="Belešku:", font=('Segoe UI', 10, 'bold'), 
                       bg='#ecf0f1', fg='#2c3e50')
        label.pack(anchor=tk.W, pady=(0, 5))
        
        beleszka_text = tk.Text(form_frame, height=10, width=50, font=('Segoe UI', 10))
        beleszka_text.pack(fill=tk.BOTH, expand=True, ipady=8)
        beleszka_text.focus()
        
        def sačuvaj():
            tekst = beleszka_text.get("1.0", tk.END).strip()
            
            if not tekst:
                messagebox.showerror("Greška", "Beleška ne može biti prazna!")
                return
            
            if self.menadzer.dodaj_beleszku(id_klijenta, tekst):
                messagebox.showinfo("Uspeh", "✓ Belešku je uspešno dodana!")
                self.ucitaj_klijente()
                dialog.destroy()
        
        # Dugmići
        btn_frame = tk.Frame(form_frame, bg='#ecf0f1')
        btn_frame.pack(fill=tk.X, pady=(15, 0))
        
        save_btn = tk.Button(btn_frame, text="✓ Sačuvaj", command=sačuvaj,
                            font=('Segoe UI', 10, 'bold'), bg='#27ae60', fg='white',
                            padx=20, pady=8, border=0, cursor='hand2',
                            activebackground='#229954')
        save_btn.pack(side=tk.LEFT, padx=5)
        
        cancel_btn = tk.Button(btn_frame, text="✕ Otkaži", command=dialog.destroy,
                              font=('Segoe UI', 10, 'bold'), bg='#e74c3c', fg='white',
                              padx=20, pady=8, border=0, cursor='hand2',
                              activebackground='#cb4335')
        cancel_btn.pack(side=tk.LEFT, padx=5)
    
    def obrisi_klijenta_dijalog(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showerror("Greška", "Molim odaberi klijenta!")
            return
        
        id_klijenta = self.tree.item(selected[0])['values'][0]
        ime = self.tree.item(selected[0])['values'][1]
        prezime = self.tree.item(selected[0])['values'][2]
        
        if messagebox.askyesno("Potvrda", f"Da li želiš da obrišeš:\n\n{ime} {prezime}?"):
            if self.menadzer.obrisi_klijenta(id_klijenta):
                messagebox.showinfo("Uspeh", "✓ Klijent je uspešno obrisan!")
                self.ucitaj_klijente()
    
    def detaljni_pregled(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showerror("Greška", "Molim odaberi klijenta!")
            return
        
        id_klijenta = self.tree.item(selected[0])['values'][0]
        klijent = self.menadzer.klijenti[id_klijenta]
        
        detail_window = tk.Toplevel(self.root)
        detail_window.title(f"Detaljni Pregled - {klijent['ime']} {klijent['prezime']}")
        detail_window.geometry("700x700")
        detail_window.transient(self.root)
        detail_window.configure(bg='#ecf0f1')
        
        # Zaglavlje
        header = tk.Frame(detail_window, bg='#3498db', height=60)
        header.pack(fill=tk.X)
        tk.Label(header, text=f"👁️ Detaljni Pregled - {klijent['ime']} {klijent['prezime']}", 
                font=('Segoe UI', 14, 'bold'), bg='#3498db', fg='white').pack(pady=10)
        
        # Sadržaj
        content = tk.Frame(detail_window, bg='#ecf0f1')
        content.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        # Info
        info_frame = tk.Frame(content, bg='white', relief=tk.RIDGE, bd=1)
        info_frame.pack(fill=tk.X, pady=(0, 15))
        
        info_label = tk.Label(info_frame, text="Osnovni Podaci", font=('Segoe UI', 11, 'bold'),
                             bg='#34495e', fg='white')
        info_label.pack(fill=tk.X, padx=10, pady=(10, 0))
        
        info_data = tk.Frame(info_frame, bg='white')
        info_data.pack(fill=tk.X, padx=15, pady=10)
        
        tk.Label(info_data, text=f"Ime i Prezime: {klijent['ime']} {klijent['prezime']}", 
                font=('Segoe UI', 10, 'bold'), bg='white', fg='#2c3e50').pack(anchor=tk.W, pady=3)
        tk.Label(info_data, text=f"Email: {klijent['email']}", 
                font=('Segoe UI', 10), bg='white', fg='#2c3e50').pack(anchor=tk.W, pady=3)
        tk.Label(info_data, text=f"Telefon: {klijent['telefon']}", 
                font=('Segoe UI', 10), bg='white', fg='#2c3e50').pack(anchor=tk.W, pady=3)
        
        # Paketi
        paketi_frame = tk.Frame(content, bg='white', relief=tk.RIDGE, bd=1)
        paketi_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 15))
        
        paketi_label = tk.Label(paketi_frame, text="📦 Dodeljeni Paketi", font=('Segoe UI', 11, 'bold'),
                               bg='#34495e', fg='white')
        paketi_label.pack(fill=tk.X, padx=10, pady=(10, 0))
        
        paketi_text = tk.Text(paketi_frame, height=8, bg='white', fg='#2c3e50',
                             font=('Segoe UI', 9), wrap=tk.WORD)
        paketi_text.pack(fill=tk.BOTH, expand=True, padx=15, pady=10)
        
        if klijent['paketi']:
            for i, paket in enumerate(klijent['paketi'], 1):
                paketi_text.insert(tk.END, f"{i}. {paket['naziv']}\n")
                paketi_text.insert(tk.END, f"   💰 Cena: {paket['cena']} din\n")
                paketi_text.insert(tk.END, f"   📅 Početak: {paket['datum_pocetka']}\n")
                paketi_text.insert(tk.END, f"   ⏰ Dodeljen: {paket['datum_dodele']}\n\n")
        else:
            paketi_text.insert(tk.END, "Nema dodeljenih paketa.")
        
        paketi_text.config(state=tk.DISABLED)
        
        # Beleške
        beleske_frame = tk.Frame(content, bg='white', relief=tk.RIDGE, bd=1)
        beleske_frame.pack(fill=tk.BOTH, expand=True)
        
        beleske_label = tk.Label(beleske_frame, text="📝 Beleške", font=('Segoe UI', 11, 'bold'),
                                bg='#34495e', fg='white')
        beleske_label.pack(fill=tk.X, padx=10, pady=(10, 0))
        
        beleske_text = tk.Text(beleske_frame, height=8, bg='white', fg='#2c3e50',
                              font=('Segoe UI', 9), wrap=tk.WORD)
        beleske_text.pack(fill=tk.BOTH, expand=True, padx=15, pady=10)
        
        if klijent['beleske']:
            for i, beleszka in enumerate(klijent['beleske'], 1):
                beleske_text.insert(tk.END, f"{i}. [{beleszka['datum']}]\n")
                beleske_text.insert(tk.END, f"   {beleszka['tekst']}\n\n")
        else:
            beleske_text.insert(tk.END, "Nema beleški.")
        
        beleske_text.config(state=tk.DISABLED)

if __name__ == "__main__":
    root = tk.Tk()
    app = GUIApp(root)
    root.mainloop()
