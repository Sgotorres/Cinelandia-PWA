--
-- PostgreSQL database dump
--

\restrict vmInkvpxphB6C3b5Qk7EyJxGGgaLtKBnJ3bBRGTU1RQ2otkVF5yEozdEe6Ci2LC

-- Dumped from database version 17.8
-- Dumped by pg_dump version 17.8

-- Started on 2026-05-03 13:26:35

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 24677)
-- Name: detalles_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalles_pedido (
    id integer NOT NULL,
    pedido_id integer,
    producto_id integer,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    talla character varying(20)
);


ALTER TABLE public.detalles_pedido OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24676)
-- Name: detalles_pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalles_pedido_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalles_pedido_id_seq OWNER TO postgres;

--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 221
-- Name: detalles_pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalles_pedido_id_seq OWNED BY public.detalles_pedido.id;


--
-- TOC entry 220 (class 1259 OID 24668)
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id integer NOT NULL,
    mesa character varying(50) NOT NULL,
    total numeric(10,2) NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24667)
-- Name: pedidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_id_seq OWNER TO postgres;

--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 219
-- Name: pedidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_id_seq OWNED BY public.pedidos.id;


--
-- TOC entry 218 (class 1259 OID 24659)
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    precio numeric(10,2) NOT NULL,
    categoria character varying(50),
    imagen_url text,
    es_recomendado boolean DEFAULT false,
    disponible boolean DEFAULT true,
    precio_g numeric(10,2) DEFAULT 0,
    precio_f numeric(10,2) DEFAULT 0
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24658)
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_seq OWNER TO postgres;

--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 217
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- TOC entry 4760 (class 2604 OID 24680)
-- Name: detalles_pedido id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido ALTER COLUMN id SET DEFAULT nextval('public.detalles_pedido_id_seq'::regclass);


--
-- TOC entry 4757 (class 2604 OID 24671)
-- Name: pedidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id SET DEFAULT nextval('public.pedidos_id_seq'::regclass);


--
-- TOC entry 4752 (class 2604 OID 24662)
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- TOC entry 4919 (class 0 OID 24677)
-- Dependencies: 222
-- Data for Name: detalles_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.detalles_pedido VALUES (28, 15, 15, 1, 34000.00, 'Mediana');
INSERT INTO public.detalles_pedido VALUES (29, 16, 13, 1, 23000.00, 'Mediana');
INSERT INTO public.detalles_pedido VALUES (30, 16, 13, 1, 30000.00, 'Grande');
INSERT INTO public.detalles_pedido VALUES (31, 17, 20, 1, 48000.00, 'Familiar');
INSERT INTO public.detalles_pedido VALUES (32, 17, 20, 1, 42000.00, 'Grande');
INSERT INTO public.detalles_pedido VALUES (33, 18, 13, 1, 30000.00, 'Grande');
INSERT INTO public.detalles_pedido VALUES (34, 19, 17, 2, 34000.00, 'Mediana');
INSERT INTO public.detalles_pedido VALUES (35, 20, 17, 1, 44000.00, 'Grande');
INSERT INTO public.detalles_pedido VALUES (36, 21, 20, 1, 48000.00, 'Familiar');
INSERT INTO public.detalles_pedido VALUES (37, 22, 20, 1, 48000.00, 'Familiar');
INSERT INTO public.detalles_pedido VALUES (38, 23, 20, 1, 48000.00, 'Familiar');
INSERT INTO public.detalles_pedido VALUES (39, 23, 20, 1, 42000.00, 'Grande');
INSERT INTO public.detalles_pedido VALUES (40, 24, 13, 2, 23000.00, 'Mediana');
INSERT INTO public.detalles_pedido VALUES (41, 24, 20, 1, 32000.00, 'Mediana');
INSERT INTO public.detalles_pedido VALUES (42, 24, 20, 1, 42000.00, 'Grande');
INSERT INTO public.detalles_pedido VALUES (43, 24, 18, 1, 46000.00, 'Familiar');


--
-- TOC entry 4917 (class 0 OID 24668)
-- Dependencies: 220
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pedidos VALUES (21, '2', 48000.00, 'pendiente', '2026-04-30 10:36:48.48266');
INSERT INTO public.pedidos VALUES (22, '2', 48000.00, 'pendiente', '2026-04-30 15:54:57.891495');
INSERT INTO public.pedidos VALUES (23, '2', 90000.00, 'pendiente', '2026-04-30 19:13:19.54698');
INSERT INTO public.pedidos VALUES (24, '7', 166000.00, 'cocinando', '2026-05-02 17:31:10.759785');
INSERT INTO public.pedidos VALUES (15, '1', 34000.00, 'finalizado', '2026-04-29 16:03:46.502182');
INSERT INTO public.pedidos VALUES (19, '1', 68000.00, 'finalizado', '2026-04-29 16:39:20.910363');
INSERT INTO public.pedidos VALUES (18, '1', 30000.00, 'finalizado', '2026-04-29 16:38:23.294943');
INSERT INTO public.pedidos VALUES (17, '1', 90000.00, 'finalizado', '2026-04-29 16:06:39.408602');
INSERT INTO public.pedidos VALUES (16, '1', 53000.00, 'finalizado', '2026-04-29 16:05:56.063163');
INSERT INTO public.pedidos VALUES (20, '7', 44000.00, 'cocinando', '2026-04-30 10:20:29.307725');


--
-- TOC entry 4915 (class 0 OID 24659)
-- Dependencies: 218
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.productos VALUES (10, 'Pizza Planeta', 'Jamón ahumado y queso mozzarella', 20000.00, 'Pizzas', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400', true, true, 27000.00, 36000.00);
INSERT INTO public.productos VALUES (11, 'Margarita', 'Salsa napole, queso mozzarella y oregano', 18000.00, 'Pizzas', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400', false, true, 23000.00, 30000.00);
INSERT INTO public.productos VALUES (12, 'Vegetariana', 'Queso mozzarella, maiz, champiñones, aceitunas negras, cebolla y pimentón', 28000.00, 'Pizzas', 'https://images.unsplash.com/photo-1573821663912-569905455b1c?q=80&w=400', false, true, 36000.00, 44000.00);
INSERT INTO public.productos VALUES (13, '3 Quesos', 'Queso mozzarella, queso amarillo, queso blanco', 23000.00, 'Pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400', true, true, 30000.00, 39000.00);
INSERT INTO public.productos VALUES (14, 'Peperoni', 'Queso mozzarella y pepperoni', 25000.00, 'Pizzas', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400', true, true, 32000.00, 40000.00);
INSERT INTO public.productos VALUES (15, 'Carnivora', 'Queso mozzarella, jamon, maiz, carne molida, pollo y cerdo', 34000.00, 'Pizzas', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=400', true, true, 44000.00, 50000.00);
INSERT INTO public.productos VALUES (16, 'Mar y Tierra', 'Queso mozzarella, jamón, salchicha ahumada, champiñon, carne molida, pollo, camarones, anchoas, tocineta, salami, maiz cebolla y pimentón', 60000.00, 'Pizzas', 'https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=400', true, true, 75000.00, 90000.00);
INSERT INTO public.productos VALUES (17, 'Charcutera', 'Queso mozzarella, queso amarillo, tocineta, jamón ahumado, peperoni salami y salchicha', 34000.00, 'Pizzas', 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?q=80&w=400', false, true, 44000.00, 50000.00);
INSERT INTO public.productos VALUES (18, 'Champiñon', 'Queso mozzarella, jamón, pollo, maiz, champiñones', 30000.00, 'Pizzas', 'https://images.unsplash.com/photo-1564936281291-294551497d81?q=80&w=400', false, true, 38000.00, 46000.00);
INSERT INTO public.productos VALUES (19, 'Granjera', 'Queso mozzarella, pollo, maiz, tocineta, cebolla y pimentón', 30000.00, 'Pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400', false, true, 38000.00, 46000.00);
INSERT INTO public.productos VALUES (20, 'Boloñesa', 'Queso mozzarella, jamon, carne molida, tocineta y pimentón', 32000.00, 'Pizzas', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=400', false, true, 42000.00, 48000.00);
INSERT INTO public.productos VALUES (21, 'Marinera', 'Queso mozzarella, camarones jamón ahumado, anchoas, maiz, cebolla y pimentón', 40000.00, 'Pizzas', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400', false, true, 50000.00, 60000.00);
INSERT INTO public.productos VALUES (22, 'Hawaiana', 'Bocadillo, queso mozzarella, jamón y piña', 29000.00, 'Pizzas', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400', false, true, 36000.00, 44000.00);


--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 221
-- Name: detalles_pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalles_pedido_id_seq', 43, true);


--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 219
-- Name: pedidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_seq', 24, true);


--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 217
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_seq', 22, true);


--
-- TOC entry 4766 (class 2606 OID 24682)
-- Name: detalles_pedido detalles_pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT detalles_pedido_pkey PRIMARY KEY (id);


--
-- TOC entry 4764 (class 2606 OID 24675)
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


--
-- TOC entry 4762 (class 2606 OID 24666)
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- TOC entry 4767 (class 2606 OID 24683)
-- Name: detalles_pedido detalles_pedido_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT detalles_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- TOC entry 4768 (class 2606 OID 24688)
-- Name: detalles_pedido detalles_pedido_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT detalles_pedido_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


-- Completed on 2026-05-03 13:26:36

--
-- PostgreSQL database dump complete
--

\unrestrict vmInkvpxphB6C3b5Qk7EyJxGGgaLtKBnJ3bBRGTU1RQ2otkVF5yEozdEe6Ci2LC

