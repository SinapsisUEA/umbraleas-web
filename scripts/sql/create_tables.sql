```sql
-- Tabla articulos
create table if not exists public.articulos (
  id               bigint generated always as identity primary key,
  titulo           text not null,
  doi              text,
  autor            text,
  autor_email      text,
  afiliacion       text,
  autor_orcid      text,
  autor_foto_url   text,
  portada_url      text,
  resumen          text,
  keywords         text[],
  contenido        text,
  secciones        jsonb,
  bibliografia     text[],
  publicado_a      timestamptz,
  created_at       timestamptz default now()
);

-- Indice FTS sugerido
create index if not exists idx_articulos_fts on public.articulos using gin (
  to_tsvector('spanish', coalesce(titulo,'') || ' ' || coalesce(resumen,'') || ' ' || coalesce(contenido,''))
);

-- Reacciones por párrafo
create table if not exists public.sinapsis_reacciones (
  id serial primary key,
  articulo_id bigint references public.articulos(id) on delete cascade,
  tipo_reaccion text not null,
  extracto text,
  usuario_nombre text,
  usuario_email text,
  fecha timestamptz default now()
);

create index if not exists idx_reacciones_articulo on public.sinapsis_reacciones(articulo_id);

-- Reacciones a bibliografía
create table if not exists public.sinapsis_bibliografia_reacciones (
  id serial primary key,
  articulo_id bigint references public.articulos(id) on delete cascade,
  referencia text,
  etiqueta text,
  usuario text,
  fecha timestamptz default now()
);

-- Intervenciones y comentarios
create table if not exists public.dashboard_intervenciones (
  id serial primary key,
  articulo_id bigint references public.articulos(id),
  articulo_titulo text,
  tipo_accion text,
  contenido text,
  usuario_nombre text,
  usuario_email text,
  canal_usado text,
  fecha timestamptz default now(),
  metadata jsonb
);

-- Contactos / inscripciones
create table if not exists public.contactos_simposio (
  id serial primary key,
  nombre text,
  email text unique,
  institucion text,
  fecha_registro timestamptz default now()
);

-- Programas y episodios
create table if not exists public.programas (
  id serial primary key,
  nombre text not null,
  descripcion text,
  tipo text,
  created_at timestamptz default now()
);

create table if not exists public.episodios (
  id serial primary key,
  programa_id int references public.programas(id),
  titulo text,
  descripcion text,
  media_url text,
  fecha_publicacion timestamptz,
  created_at timestamptz default now()
):
```
