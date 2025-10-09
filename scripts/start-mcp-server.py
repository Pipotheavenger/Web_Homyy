#!/usr/bin/env python3
"""
Script para iniciar el MCP Server de Supabase
Ejecutar: python scripts/start-mcp-server.py
"""

import os
import sys
import subprocess
from pathlib import Path

def load_env_vars():
    """Cargar variables de entorno desde .env.local"""
    env_file = Path(__file__).parent.parent / '.env.local'
    
    if not env_file.exists():
        print("❌ No se encontró el archivo .env.local")
        print("📝 Crea el archivo .env.local con tus credenciales de Supabase:")
        print("")
        print("NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase")
        print("NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase")
        print("SUPABASE_PROJECT_REF=tu_proyecto_ref")
        print("SUPABASE_DB_PASSWORD=tu_password_db")
        print("SUPABASE_ACCESS_TOKEN=tu_access_token")
        return False
    
    # Cargar variables de entorno
    with open(env_file, 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value
    
    return True

def start_mcp_server():
    """Iniciar el servidor MCP de Supabase"""
    print("🚀 Iniciando MCP Server de Supabase...")
    
    # Verificar que las variables necesarias estén configuradas
    required_vars = [
        'SUPABASE_PROJECT_REF',
        'SUPABASE_DB_PASSWORD'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Faltan las siguientes variables de entorno: {', '.join(missing_vars)}")
        return False
    
    try:
        # Buscar el ejecutable en el directorio de scripts de Python
        python_scripts_dir = Path.home() / "AppData" / "Roaming" / "Python" / "Python313" / "Scripts"
        mcp_server_exe = python_scripts_dir / "supabase-mcp-server.exe"
        
        if not mcp_server_exe.exists():
            print("❌ No se encontró supabase-mcp-server.exe")
            print(f"💡 Buscando en: {python_scripts_dir}")
            return False
        
        # Iniciar el servidor MCP
        cmd = [str(mcp_server_exe)]
        print(f"🔧 Ejecutando: {' '.join(cmd)}")
        
        # Configurar variables de entorno
        env = os.environ.copy()
        
        subprocess.run(cmd, env=env, check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al iniciar el servidor MCP: {e}")
        return False
    except FileNotFoundError:
        print("❌ No se encontró el comando supabase-mcp-server")
        print("💡 Asegúrate de que esté instalado: pip install supabase-mcp-server")
        return False
    
    return True

if __name__ == "__main__":
    print("🔍 Verificando configuración...")
    
    if not load_env_vars():
        sys.exit(1)
    
    print("✅ Variables de entorno cargadas")
    
    if start_mcp_server():
        print("✅ MCP Server iniciado correctamente")
    else:
        print("❌ Error al iniciar MCP Server")
        sys.exit(1)
