import json
import os
import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from datetime import datetime

PODACI_FAJL = "klijenti_podaci.json"

class MenazerKlijenata:
    def __init__(self):
        self.klijenti = self.ucitaj_podatke()
    
    def ucitaj_podatke(self):
        if os.path.exists(PODACI_FAJL):
            with open(PODACI_FAJL, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def sacuvaj_podatke(self):
        with open(PODACI_FAJL, 'w', encoding='utf-8') as f:
            json.dump(self.klijenti, f, ensure_ascii=False, indent=2)
    
    def dodaj_klijenta(self, ime, prezime, email, telefon):
        id_klijenta = str(len(self.klijenti) + 1)
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
        self.root.geometry("900x600")
        self.root.configure(bg='#f0f0f0')
        
        self.menadzer = MenazerKlijenata()
        
        # Stil
        style = ttk.Style()
        style.theme_use('clam')
        
        # Glavni frame
        self.main_frame = ttk.Frame(root)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Naslov
        title_label = ttk.Label(self.main_frame, text="MENADŽER KLIJENATA", 
                               font=('Helvetica', 16, 'bold'))
        title_label.pack(pady=10)
        
        # Dugmići za akcije
        button_frame = ttk.Frame(self.main_frame)
        button_frame.pack(fill=tk.X, pady=10)
        
        ttk.Button(button_frame, text="Dodaj Klijenta", 
                  command=self.dodaj_klijenta_dijalog).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Dodeli Paket", 
                  command=self.dodeli_paket_dijalog).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Dodaj Belešku", 
                  command=self.dodaj_beleszku_dijalog).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Obriši Klijenta", 
                  command=self.obrisi_klijenta_dijalog).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Osveži", 
                  command=self.ucitaj_klijente).pack(side=tk.LEFT, padx=5)
        
        # Tabela sa klijentima
        tree_frame = ttk.Frame(self.main_frame)
        tree_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(tree_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Treeview
        self.tree = ttk.Treeview(tree_frame, columns=('ID', 'Ime', 'Prezime', 'Email', 'Telefon', 'Paketi', 'Beleške'),
                                 height=15, yscrollcommand=scrollbar.set)
        scrollbar.config(command=self.tree.yview)
        
        self.tree.column('#0', width=0, stretch=tk.NO)
        self.tree.column('ID', anchor=tk.W, width=40)
        self.tree.column('Ime', anchor=tk.W, width=100)
        self.tree.column('Prezime', anchor=tk.W, width=100)
        self.tree.column('Email', anchor=tk.W, width=150)
        self.tree.column('Telefon', anchor=tk.W, width=100)
        self.tree.column('Paketi', anchor=tk.CENTER, width=60)
        self.tree.column('Beleške', anchor=tk.CENTER, width=60)
        
        self.tree.heading('#0', text='', anchor=tk.W)
        self.tree.heading('ID', text='ID', anchor=tk.W)
        self.tree.heading('Ime', text='Ime', anchor=tk.W)
        self.tree.heading('Prezime', text='Prezime', anchor=tk.W)
        self.tree.heading('Email', text='Email', anchor=tk.W)
        self.tree.heading('Telefon', text='Telefon', anchor=tk.W)
        self.tree.heading('Paketi', text='Paketi', anchor=tk.CENTER)
        self.tree.heading('Beleške', text='Beleške', anchor=tk.CENTER)
        
        self.tree.pack(fill=tk.BOTH, expand=True)
        
        # Dugme za detaljni pregled
        detail_frame = ttk.Frame(self.main_frame)
        detail_frame.pack(fill=tk.X, pady=10)
        ttk.Button(detail_frame, text="Detaljni Pregled Klijenta", 
                  command=self.detaljni_pregled).pack(side=tk.LEFT, padx=5)
        
        # Učitaj klijente
        self.ucitaj_klijente()
    
    def ucitaj_klijente(self):
        # Očisti tabelu
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Učitaj klijente
        for id_klijenta, klijent in self.menadzer.klijenti.items():
            self.tree.insert('', tk.END, text='',
                           values=(id_klijenta, klijent['ime'], klijent['prezime'],
                                 klijent['email'], klijent['telefon'],
                                 len(klijent['paketi']), len(klijent['beleske'])))
    
    def dodaj_klijenta_dijalog(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("Dodaj Klijenta")
        dialog.geometry("400x250")
        dialog.transient(self.root)
        dialog.grab_set()
        
        ttk.Label(dialog, text="Ime:").pack(pady=5)
        ime_entry = ttk.Entry(dialog, width=30)
        ime_entry.pack(pady=5)
        
        ttk.Label(dialog, text="Prezime:").pack(pady=5)
        prezime_entry = ttk.Entry(dialog, width=30)
        prezime_entry.pack(pady=5)
        
        ttk.Label(dialog, text="Email:").pack(pady=5)
        email_entry = ttk.Entry(dialog, width=30)
        email_entry.pack(pady=5)
        
        ttk.Label(dialog, text="Telefon:").pack(pady=5)
        telefon_entry = ttk.Entry(dialog, width=30)
        telefon_entry.pack(pady=5)
        
        def sačuvaj():
            ime = ime_entry.get().strip()
            prezime = prezime_entry.get().strip()
            email = email_entry.get().strip()
            telefon = telefon_entry.get().strip()
            
            if not ime or not prezime or not email:
                messagebox.showerror("Greška", "Molim unesi sve obavezne podatke!")
                return
            
            self.menadzer.dodaj_klijenta(ime, prezime, email, telefon)
            messagebox.showinfo("Uspeh", f"Klijent {ime} {prezime} je dodat!")
            self.ucitaj_klijente()
            dialog.destroy()
        
        ttk.Button(dialog, text="Sačuvaj", command=sačuvaj).pack(pady=20)
    
    def dodeli_paket_dijalog(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showerror("Greška", "Molim odaberi klijenta!")
            return
        
        id_klijenta = self.tree.item(selected[0])['values'][0]
        
        dialog = tk.Toplevel(self.root)
        dialog.title("Dodeli Paket")
        dialog.geometry("400x250")
        dialog.transient(self.root)
        dialog.grab_set()
        
        ttk.Label(dialog, text="Naziv Paketa:").pack(pady=5)
        naziv_entry = ttk.Entry(dialog, width=30)
        naziv_entry.pack(pady=5)
        
        ttk.Label(dialog, text="Cena (dinara):").pack(pady=5)
        cena_entry = ttk.Entry(dialog, width=30)
        cena_entry.pack(pady=5)
        
        ttk.Label(dialog, text="Datum Početka (YYYY-MM-DD):").pack(pady=5)
        datum_entry = ttk.Entry(dialog, width=30)
        datum_entry.pack(pady=5)
        
        def sačuvaj():
            naziv = naziv_entry.get().strip()
            cena = cena_entry.get().strip()
            datum = datum_entry.get().strip()
            
            if not naziv or not cena:
                messagebox.showerror("Greška", "Molim unesi sve obavezne podatke!")
                return
            
            if self.menadzer.dodeli_paket(id_klijenta, naziv, cena, datum):
                messagebox.showinfo("Uspeh", f"Paket '{naziv}' je dodeljen!")
                self.ucitaj_klijente()
                dialog.destroy()
            else:
                messagebox.showerror("Greška", "Greška pri dodeli paketa!")
        
        ttk.Button(dialog, text="Sačuvaj", command=sačuvaj).pack(pady=20)
    
    def dodaj_beleszku_dijalog(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showerror("Greška", "Molim odaberi klijenta!")
            return
        
        id_klijenta = self.tree.item(selected[0])['values'][0]
        
        dialog = tk.Toplevel(self.root)
        dialog.title("Dodaj Belešku")
        dialog.geometry("400x200")
        dialog.transient(self.root)
        dialog.grab_set()
        
        ttk.Label(dialog, text="Belešku:").pack(pady=5)
        beleszka_text = tk.Text(dialog, height=6, width=40)
        beleszka_text.pack(pady=5)
        
        def sačuvaj():
            tekst = beleszka_text.get("1.0", tk.END).strip()
            
            if not tekst:
                messagebox.showerror("Greška", "Beleška ne može biti prazna!")
                return
            
            if self.menadzer.dodaj_beleszku(id_klijenta, tekst):
                messagebox.showinfo("Uspeh", "Belešku je dodana!")
                self.ucitaj_klijente()
                dialog.destroy()
            else:
                messagebox.showerror("Greška", "Greška pri dodavanju beleške!")
        
        ttk.Button(dialog, text="Sačuvaj", command=sačuvaj).pack(pady=10)
    
    def obrisi_klijenta_dijalog(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showerror("Greška", "Molim odaberi klijenta!")
            return
        
        id_klijenta = self.tree.item(selected[0])['values'][0]
        ime = self.tree.item(selected[0])['values'][1]
        prezime = self.tree.item(selected[0])['values'][2]
        
        if messagebox.askyesno("Potvrda", f"Da li sigurno želiš da obrišeš klijenta {ime} {prezime}?"):
            if self.menadzer.obrisi_klijenta(id_klijenta):
                messagebox.showinfo("Uspeh", "Klijent je obrisan!")
                self.ucitaj_klijente()
            else:
                messagebox.showerror("Greška", "Greška pri brisanju klijenta!")
    
    def detaljni_pregled(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showerror("Greška", "Molim odaberi klijenta!")
            return
        
        id_klijenta = self.tree.item(selected[0])['values'][0]
        klijent = self.menadzer.klijenti[id_klijenta]
        
        detail_window = tk.Toplevel(self.root)
        detail_window.title(f"Detaljni Pregled - {klijent['ime']} {klijent['prezime']}")
        detail_window.geometry("600x500")
        detail_window.transient(self.root)
        
        # Info
        info_frame = ttk.LabelFrame(detail_window, text="Osnovni Podaci", padding=10)
        info_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(info_frame, text=f"Ime i Prezime: {klijent['ime']} {klijent['prezime']}").pack(anchor=tk.W)
        ttk.Label(info_frame, text=f"Email: {klijent['email']}").pack(anchor=tk.W)
        ttk.Label(info_frame, text=f"Telefon: {klijent['telefon']}").pack(anchor=tk.W)
        
        # Paketi
        paketi_frame = ttk.LabelFrame(detail_window, text="Paketi", padding=10)
        paketi_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        if klijent['paketi']:
            for i, paket in enumerate(klijent['paketi'], 1):
                paket_text = f"{i}. {paket['naziv']} - {paket['cena']} din (Od: {paket['datum_pocetka']})"
                ttk.Label(paketi_frame, text=paket_text).pack(anchor=tk.W)
        else:
            ttk.Label(paketi_frame, text="Nema dodeljenih paketa.").pack(anchor=tk.W)
        
        # Beleške
        beleske_frame = ttk.LabelFrame(detail_window, text="Beleške", padding=10)
        beleske_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        if klijent['beleske']:
            for i, beleszka in enumerate(klijent['beleske'], 1):
                beleszka_text = f"{i}. [{beleszka['datum']}]\n   {beleszka['tekst']}\n"
                ttk.Label(beleske_frame, text=beleszka_text, wraplength=500, justify=tk.LEFT).pack(anchor=tk.W)
        else:
            ttk.Label(beleske_frame, text="Nema beleški.").pack(anchor=tk.W)

if __name__ == "__main__":
    root = tk.Tk()
    app = GUIApp(root)
    root.mainloop()
