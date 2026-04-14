"use server";

import { hash, compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, createSession } from "@/lib/auth";

function appendQuery(url: string, key: string, value: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}

function redirectWithError(url: string, message: string): never {
  redirect(appendQuery(url, "error", message));
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function registerAction(formData: FormData) {
  const firstName = readText(formData, "firstName");
  const lastName = readText(formData, "lastName");
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");
  const confirmPassword = readText(formData, "confirmPassword");

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    redirectWithError("/register", "Popuni sva polja.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirectWithError("/register", "Unesi ispravnu email adresu.");
  }

  if (password.length < 8) {
    redirectWithError("/register", "Lozinka mora imati najmanje 8 karaktera.");
  }

  if (password !== confirmPassword) {
    redirectWithError("/register", "Lozinke se ne poklapaju.");
  }

  const existing = await prisma.userProfile.findFirst({
    where: {
      email
    }
  });

  if (existing) {
    redirectWithError("/register", "Nalog sa ovom email adresom vec postoji.");
  }

  const passwordHash = await hash(password, 10);
  const user = await prisma.userProfile.create({
    data: {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      passwordHash,
      plan: "free",
      verified: false,
      isPremium: false,
      wantsEmailReminders: true
    }
  });

  await createSession(user.id);
  redirect("/");
}

export async function loginAction(formData: FormData) {
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");

  if (!email || !password) {
    redirectWithError("/login", "Unesi email adresu i lozinku.");
  }

  const user = await prisma.userProfile.findFirst({
    where: { email }
  });

  if (!user?.passwordHash) {
    redirectWithError("/login", "Pogresna email adresa ili lozinka.");
  }

  const passwordMatches = await compare(password, user.passwordHash);

  if (!passwordMatches) {
    redirectWithError("/login", "Pogresna email adresa ili lozinka.");
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  clearSession();
  redirect("/login");
}
