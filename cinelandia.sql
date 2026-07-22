--
-- PostgreSQL database dump
--

\restrict kVUi5WteUC744i5KZfT8B84xujBgLkSF3adZ36TGk9eaE3XFltHUxNMTXLikaLs

-- Dumped from database version 17.8
-- Dumped by pg_dump version 17.8

-- Started on 2026-07-22 15:15:07

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
-- TOC entry 225 (class 1259 OID 24736)
-- Name: configuracion_sistema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion_sistema (
    clave character varying(50) NOT NULL,
    valor jsonb NOT NULL
);


ALTER TABLE public.configuracion_sistema OWNER TO postgres;

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
    talla character varying(20),
    producto_2_id integer
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
-- TOC entry 4950 (class 0 OID 0)
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
-- TOC entry 4951 (class 0 OID 0)
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
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 217
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- TOC entry 224 (class 1259 OID 24721)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash text NOT NULL,
    rol character varying(20) DEFAULT 'admin'::character varying
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24720)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 223
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4769 (class 2604 OID 24680)
-- Name: detalles_pedido id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido ALTER COLUMN id SET DEFAULT nextval('public.detalles_pedido_id_seq'::regclass);


--
-- TOC entry 4766 (class 2604 OID 24671)
-- Name: pedidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id SET DEFAULT nextval('public.pedidos_id_seq'::regclass);


--
-- TOC entry 4761 (class 2604 OID 24662)
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- TOC entry 4770 (class 2604 OID 24724)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4944 (class 0 OID 24736)
-- Dependencies: 225
-- Data for Name: configuracion_sistema; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracion_sistema (clave, valor) FROM stdin;
estado_tienda	{"abierta": false}
\.


--
-- TOC entry 4941 (class 0 OID 24677)
-- Dependencies: 222
-- Data for Name: detalles_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalles_pedido (id, pedido_id, producto_id, cantidad, precio_unitario, talla, producto_2_id) FROM stdin;
28	15	15	1	34000.00	Mediana	\N
29	16	13	1	23000.00	Mediana	\N
30	16	13	1	30000.00	Grande	\N
31	17	20	1	48000.00	Familiar	\N
32	17	20	1	42000.00	Grande	\N
33	18	13	1	30000.00	Grande	\N
34	19	17	2	34000.00	Mediana	\N
35	20	17	1	44000.00	Grande	\N
36	21	20	1	48000.00	Familiar	\N
37	22	20	1	48000.00	Familiar	\N
38	23	20	1	48000.00	Familiar	\N
39	23	20	1	42000.00	Grande	\N
40	24	13	2	23000.00	Mediana	\N
41	24	20	1	32000.00	Mediana	\N
42	24	20	1	42000.00	Grande	\N
43	24	18	1	46000.00	Familiar	\N
44	25	13	1	30000.00	Grande	\N
45	25	13	1	23000.00	Mediana	\N
46	26	20	1	32000.00	Mediana	\N
47	26	20	1	42000.00	Grande	\N
48	27	20	1	48000.00	Familiar	\N
49	27	20	1	42000.00	Grande	\N
50	28	13	1	30000.00	Grande	\N
51	28	13	1	39000.00	Familiar	\N
52	29	13	1	30000.00	Grande	\N
53	29	13	1	39000.00	Familiar	\N
54	30	20	1	42000.00	Grande	\N
55	30	20	1	48000.00	Familiar	\N
56	31	15	1	34000.00	Mediana	\N
57	31	15	1	44000.00	Grande	\N
58	32	16	1	60000.00	Mediana	\N
59	32	17	1	34000.00	Mediana	\N
60	33	13	1	23000.00	Mediana	\N
61	33	15	1	34000.00	Mediana	\N
62	34	19	1	30000.00	Mediana	\N
63	34	16	1	60000.00	Mediana	\N
64	35	20	1	42000.00	Grande	\N
65	35	20	2	32000.00	Mediana	\N
66	36	19	1	46000.00	Familiar	\N
67	36	22	1	36000.00	Grande	\N
68	37	17	1	34000.00	Mediana	\N
69	38	15	1	50000.00	Familiar	\N
70	39	13	1	23000.00	Mediana	\N
71	40	15	1	34000.00	Mediana	\N
72	35	19	1	38000.00	Grande	\N
73	35	19	1	46000.00	Familiar	\N
74	41	17	1	50000.00	Familiar	\N
75	41	19	1	38000.00	Grande	\N
76	42	13	1	30000.00	Grande	\N
77	41	16	1	90000.00	Familiar	\N
78	42	15	1	50000.00	Familiar	\N
79	41	14	1	32000.00	Grande	\N
80	43	13	1	23000.00	Mediana	\N
81	43	16	1	90000.00	Familiar	\N
82	43	14	1	32000.00	Grande	\N
83	43	11	1	23000.00	Grande	\N
84	44	13	1	23000.00	Mediana	\N
85	44	10	1	36000.00	Familiar	\N
86	44	16	1	90000.00	Familiar	\N
87	44	14	1	32000.00	Grande	\N
88	45	11	1	30000.00	Familiar	\N
89	46	20	1	32000.00	Mediana	\N
90	46	20	1	42000.00	Grande	\N
91	47	20	1	48000.00	Familiar	\N
92	47	20	1	42000.00	Grande	\N
93	48	20	1	48000.00	Familiar	\N
94	48	20	1	42000.00	Grande	\N
95	49	13	3	23000.00	Mediana	\N
96	49	20	2	42000.00	Grande	\N
97	49	17	2	50000.00	Familiar	\N
98	50	20	1	42000.00	Grande	\N
99	50	20	1	48000.00	Familiar	\N
\.


--
-- TOC entry 4939 (class 0 OID 24668)
-- Dependencies: 220
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id, mesa, total, estado, fecha) FROM stdin;
43	Mesa 2	168000.00	pendiente	2026-07-09 15:06:52.06524
44	Mesa 1	181000.00	pendiente	2026-07-09 15:07:30.215545
45	Mesa 7	30000.00	pendiente	2026-07-09 15:21:02.706959
46	7	74000.00	pendiente	2026-07-12 10:39:24.055238
47	Retiro	90000.00	pendiente	2026-07-12 10:46:59.184472
49	Delivery	253000.00	pendiente	2026-07-13 09:28:02.811153
48	Delivery	90000.00	listo	2026-07-12 10:49:35.142831
50	Delivery	90000.00	cocinando	2026-07-13 13:38:46.627898
37	Mesa 7	34000.00	finalizado	2026-07-09 10:51:47.637702
39	Mesa 7	23000.00	finalizado	2026-07-09 11:07:55.933794
38	Mesa 7	50000.00	finalizado	2026-07-09 10:53:05.233833
36	Mesa 5	82000.00	finalizado	2026-07-09 10:51:18.773257
34	Mesa 5	90000.00	finalizado	2026-07-07 10:44:19.913226
15	1	34000.00	finalizado	2026-04-29 16:03:46.502182
32	Mesa 1	94000.00	finalizado	2026-07-07 10:41:05.071022
33	Mesa 4	57000.00	finalizado	2026-07-07 10:44:03.63923
19	1	68000.00	finalizado	2026-04-29 16:39:20.910363
18	1	30000.00	finalizado	2026-04-29 16:38:23.294943
17	1	90000.00	finalizado	2026-04-29 16:06:39.408602
16	1	53000.00	finalizado	2026-04-29 16:05:56.063163
40	Mesa 7	34000.00	finalizado	2026-07-09 11:31:58.480114
35	Mesa 7	190000.00	finalizado	2026-07-07 10:55:35.266585
42	Mesa 7	80000.00	finalizado	2026-07-09 15:05:25.994273
41	Mesa 7	210000.00	finalizado	2026-07-09 11:32:48.39007
31	Retiro	78000.00	finalizado	2026-06-22 16:45:49.206883
30	Retiro	90000.00	finalizado	2026-06-22 16:45:38.187334
29	Delivery	69000.00	finalizado	2026-06-22 16:17:06.672003
28	11	69000.00	finalizado	2026-06-22 16:16:37.708041
27	7	90000.00	finalizado	2026-05-21 10:20:39.322547
26	11	74000.00	finalizado	2026-05-15 14:39:05.01674
25	7	53000.00	finalizado	2026-05-08 08:56:38.570406
24	7	166000.00	finalizado	2026-05-02 17:31:10.759785
23	2	90000.00	finalizado	2026-04-30 19:13:19.54698
22	2	48000.00	finalizado	2026-04-30 15:54:57.891495
21	2	48000.00	finalizado	2026-04-30 10:36:48.48266
20	7	44000.00	finalizado	2026-04-30 10:20:29.307725
\.


--
-- TOC entry 4937 (class 0 OID 24659)
-- Dependencies: 218
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, nombre, descripcion, precio, categoria, imagen_url, es_recomendado, disponible, precio_g, precio_f) FROM stdin;
13	3 Quesos	Queso mozzarella, queso amarillo, queso blanco	23000.00	Pizzas	https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400	f	t	30000.00	39000.00
15	Carnivora	Queso mozzarella, jamon, maiz, carne molida, pollo y cerdo	34000.00	Pizzas	https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=400	f	t	44000.00	50000.00
10	Pizza Planeta	Jamón ahumado y queso mozzarella	20000.00	Pizzas	https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400	f	t	27000.00	36000.00
14	Peperoni	Queso mozzarella y pepperoni	25000.00	Pizzas	https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400	t	t	32000.00	40000.00
11	Margarita	Salsa napole, queso mozzarella y oregano	18000.00	Pizzas	https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400	t	t	23000.00	30000.00
12	Vegetariana	Queso mozzarella, maiz, champiñones, aceitunas negras, cebolla y pimentón	28000.00	Pizzas	https://images.unsplash.com/photo-1573821663912-569905455b1c?q=80&w=400	f	t	36000.00	44000.00
17	Charcutera	Queso mozzarella, queso amarillo, tocineta, jamón ahumado, peperoni salami y salchicha	34000.00	Pizzas	https://images.unsplash.com/photo-1555072956-7758afb20e8f?q=80&w=400	f	t	44000.00	50000.00
18	Champiñon	Queso mozzarella, jamón, pollo, maiz, champiñones	30000.00	Pizzas	https://images.unsplash.com/photo-1564936281291-294551497d81?q=80&w=400	f	t	38000.00	46000.00
19	Granjera	Queso mozzarella, pollo, maiz, tocineta, cebolla y pimentón	30000.00	Pizzas	https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400	f	t	38000.00	46000.00
22	Hawaiana	Bocadillo, queso mozzarella, jamón y piña	29000.00	Pizzas	https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400	f	t	36000.00	44000.00
20	Boloñesa	Queso mozzarella, jamon, carne molida, tocineta y pimentón	32000.00	Pizzas	https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=400	f	t	42000.00	48000.00
16	Mar y Tierra	Queso mozzarella, jamón, salchicha ahumada, champiñon, carne molida, pollo, camarones, anchoas, tocineta, salami, maiz cebolla y pimentón	60000.00	Pizzas	https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=400	f	t	75000.00	90000.00
21	Marinera	Queso mozzarella, camarones jamón ahumado, anchoas, maiz, cebolla y pimentón	40000.00	Pizzas	https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400	t	t	50000.00	60000.00
\.


--
-- TOC entry 4943 (class 0 OID 24721)
-- Dependencies: 224
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, username, password_hash, rol) FROM stdin;
1	admin	cinelandia2026	admin
\.


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 221
-- Name: detalles_pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalles_pedido_id_seq', 99, true);


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 219
-- Name: pedidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_seq', 50, true);


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 217
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_seq', 22, true);


--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 223
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, true);


--
-- TOC entry 4787 (class 2606 OID 24742)
-- Name: configuracion_sistema configuracion_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (clave);


--
-- TOC entry 4779 (class 2606 OID 24682)
-- Name: detalles_pedido detalles_pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT detalles_pedido_pkey PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 24675)
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


--
-- TOC entry 4773 (class 2606 OID 24666)
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 24729)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4785 (class 2606 OID 24731)
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- TOC entry 4780 (class 1259 OID 24734)
-- Name: idx_detalles_pedido_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detalles_pedido_id ON public.detalles_pedido USING btree (pedido_id);


--
-- TOC entry 4781 (class 1259 OID 24735)
-- Name: idx_detalles_producto_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detalles_producto_id ON public.detalles_pedido USING btree (producto_id);


--
-- TOC entry 4774 (class 1259 OID 24732)
-- Name: idx_pedidos_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedidos_estado ON public.pedidos USING btree (estado) WHERE ((estado)::text <> 'finalizado'::text);


--
-- TOC entry 4775 (class 1259 OID 24733)
-- Name: idx_pedidos_fecha_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pedidos_fecha_desc ON public.pedidos USING btree (fecha DESC);


--
-- TOC entry 4788 (class 2606 OID 24683)
-- Name: detalles_pedido detalles_pedido_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT detalles_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- TOC entry 4789 (class 2606 OID 24743)
-- Name: detalles_pedido detalles_pedido_producto_2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT detalles_pedido_producto_2_id_fkey FOREIGN KEY (producto_2_id) REFERENCES public.productos(id) ON DELETE SET NULL;


--
-- TOC entry 4790 (class 2606 OID 24688)
-- Name: detalles_pedido detalles_pedido_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_pedido
    ADD CONSTRAINT detalles_pedido_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


-- Completed on 2026-07-22 15:15:08

--
-- PostgreSQL database dump complete
--

\unrestrict kVUi5WteUC744i5KZfT8B84xujBgLkSF3adZ36TGk9eaE3XFltHUxNMTXLikaLs

