import json
import os
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
        print("Podaci su uspesno sacuvani!")
    
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
        print(f"Klijent {ime} {prezime} je dodat! (ID: {id_klijenta})")
        return id_klijenta
    
    def dodeli_paket(self, id_klijenta, naziv_paketa, cena, datum_pocetka):
        if id_klijenta not in self.klijenti:
            print("Klijent sa tim ID-om nije pronadjen!")
            return
        
        paket = {
            "naziv": naziv_paketa,
            "cena": cena,
            "datum_pocetka": datum_pocetka,
            "datum_dodele": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        self.klijenti[id_klijenta]["paketi"].append(paket)
        self.sacuvaj_podatke()
        print(f"Paket '{naziv_paketa}' je dodeljen klijentu!")
    
    def dodaj_beleszku(self, id_klijenta, tekst_beleske):
        if id_klijenta not in self.klijenti:
            print("Klijent sa tim ID-om nije pronadjen!")
            return
        
        beleszka = {
            "tekst": tekst_beleske,
            "datum": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        self.klijenti[id_klijenta]["beleske"].append(beleszka)
        self.sacuvaj_podatke()
        print("Beliska je dodana!")
    
    def prikazi_sve_klijente(self):
        if not self.klijenti:
            print("Nema registrovanih klijenata.")
            return
        
        print("\n" + "="*60)
        print("LISTA KLIJENATA")
        print("="*60)
        
        for id_klijenta, klijent in self.klijenti.items():
            print(f"\nID: {id_klijenta}")
            print(f"Ime i prezime: {klijent['ime']} {klijent['prezime']}")
            print(f"Email: {klijent['email']}")
            print(f"Telefon: {klijent['telefon']}")
            print(f"Broj paketa: {len(klijent['paketi'])}")
            print(f"Broj beleski: {len(klijent['beleske'])}")
    
    def prikazi_detalje_klijenta(self, id_klijenta):
        if id_klijenta not in self.klijenti:
            print("Klijent sa tim ID-om nije pronadjen!")
            return
        
        klijent = self.klijenti[id_klijenta]
        
        print("\n" + "="*60)
        print(f"DETALJI KLIJENTA - {klijent['ime']} {klijent['prezime']}")
        print("="*60)
        
        print(f"Email: {klijent['email']}")
        print(f"Telefon: {klijent['telefon']}")
        
        print("\nPAKETI:")
        if klijent['paketi']:
            for i, paket in enumerate(klijent['paketi'], 1):
                print(f"  {i}. {paket['naziv']} - {paket['cena']} din (Od: {paket['datum_pocetka']})")
        else:
            print("  Nema dodeljenih paketa.")
        
        print("\nBELESKE:")
        if klijent['beleske']:
            for i, beleszka in enumerate(klijent['beleske'], 1):
                print(f"  {i}. [{beleszka['datum']}] {beleszka['tekst']}")
        else:
            print("  Nema beleski.")

def meni():
    menadzer = MenazerKlijenata()
    
    while True:
        print("\n" + "="*60)
        print("MENADZER KLIJENATA")
        print("="*60)
        print("1. Dodaj novog klijenta")
        print("2. Dodeli paket proizvoda")
        print("3. Dodaj belsku za klijenta")
        print("4. Prikazi sve klijente")
        print("5. Prikazi detalje klijenta")
        print("6. Izlaz")
        print("="*60)
        
        izbor = input("Odaberi opciju (1-6): ").strip()
        
        if izbor == "1":
            print("\n--- DODAVANJE NOVOG KLIJENTA ---")
            ime = input("Unesi ime: ").strip()
            prezime = input("Unesi prezime: ").strip()
            email = input("Unesi email: ").strip()
            telefon = input("Unesi telefon: ").strip()
            
            if ime and prezime and email:
                menadzer.dodaj_klijenta(ime, prezime, email, telefon)
            else:
                print("Molim unesi sve obavezne podatke!")
        
        elif izbor == "2":
            print("\n--- DODELJIVANJE PAKETA ---")
            menadzer.prikazi_sve_klijente()
            id_klijenta = input("\nUnesi ID klijenta: ").strip()
            
            if id_klijenta in menadzer.klijenti:
                naziv_paketa = input("Unesi naziv paketa: ").strip()
                cena = input("Unesi cenu (dinara): ").strip()
                datum_pocetka = input("Unesi datum pocetka (YYYY-MM-DD): ").strip()
                
                if naziv_paketa and cena:
                    menadzer.dodeli_paket(id_klijenta, naziv_paketa, cena, datum_pocetka)
                else:
                    print("Molim unesi sve obavezne podatke!")
            else:
                print("Klijent sa tim ID-om nije pronadjen!")
        
        elif izbor == "3":
            print("\n--- DODAVANJE BELESKE ---")
            menadzer.prikazi_sve_klijente()
            id_klijenta = input("\nUnesi ID klijenta: ").strip()
            
            if id_klijenta in menadzer.klijenti:
                tekst_beleske = input("Unesi belsku: ").strip()
                if tekst_beleske:
                    menadzer.dodaj_beleszku(id_klijenta, tekst_beleske)
                else:
                    print("Beliska ne moze biti prazna!")
            else:
                print("Klijent sa tim ID-om nije pronadjen!")
        
        elif izbor == "4":
            menadzer.prikazi_sve_klijente()
        
        elif izbor == "5":
            print("\n--- DETALJI KLIJENTA ---")
            menadzer.prikazi_sve_klijente()
            id_klijenta = input("\nUnesi ID klijenta: ").strip()
            menadzer.prikazi_detalje_klijenta(id_klijenta)
        
        elif izbor == "6":
            print("\nDo vidjenja!")
            break
        
        else:
            print("Nevalidna opcija! Molim odaberi broj od 1 do 6.")

if __name__ == "__main__":
    meni()
