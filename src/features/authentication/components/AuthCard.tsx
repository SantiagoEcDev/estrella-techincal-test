"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthCard = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Bienvenido</CardTitle>

        <CardDescription>
          {activeTab === "login"
            ? "Inicia sesión para continuar."
            : "Crea tu cuenta para comenzar."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>

            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginForm />
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <RegisterForm onSuccess={() => setActiveTab("login")} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthCard;
