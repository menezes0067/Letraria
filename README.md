# Letraria

Sistema de gestão de empréstimos de biblioteca, desenvolvido como projeto acadêmico com foco na aplicação prática de padrões de projeto: **MVC**, **DAO**, **Builder**, **Command** (com Factory Method embutido) e **Polimorfismo**.

## Stack

- **Backend**: Node.js + TypeScript (ESM) + Express 5 + better-sqlite3
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Radix UI
- **Gerenciador de pacotes**: pnpm

## Como rodar

### Backend
```bash
cd backend
pnpm install
pnpm dev
```
Servidor sobe com `tsx` executando `src/app.ts`. O banco SQLite é criado automaticamente a partir de `database/schema.sql` na primeira execução.

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```
Aplicação sobe via Vite.

## Estrutura do backend

```
backend/
├── src/
│   ├── models/
│   │   ├── book.ts          # classe abstrata Book (implementa Ilendable)
│   │   ├── fisic.ts          # Book físico
│   │   ├── ebook.ts          # Book digital
│   │   ├── audiobook.ts      # Book em áudio
│   │   ├── user.ts           # entidade User
│   │   ├── loan.ts           # entidade Loan (empréstimo)
│   │   └── activity.ts       # ActivityEntry (log de auditoria)
│   │
│   ├── interfaces/
│   │   └── Ilendable.ts      # contrato de comportamento (base do polimorfismo)
│   │
│   ├── builders/
│   │   ├── bookBuilder.ts    # Builder + Factory Method (via REGISTRY)
│   │   └── userBuilder.ts    # Builder de User
│   │
│   ├── command/
│   │   ├── command.ts        # interface ICommand<Input, Output>
│   │   ├── command-factory.ts# CommandFactory (registry de Commands)
│   │   └── actions/          # cada Action implementa ICommand
│   │
│   ├── dao/
│   │   ├── *-dao-interface.ts# contratos (IBookDAO, IUserDAO, ILoanDAO, IActivityDAO)
│   │   └── impl/              # implementações SQLite
│   │
│   ├── controllers/           # camada MVC — recebem request, delegam ao CommandFactory
│   ├── routes/                # mapeamento de rotas Express
│   ├── composition/
│   │   └── create-app.ts      # injeção de dependências (DAOs, Actions, Controllers)
│   ├── database/
│   │   ├── db.ts
│   │   └── schema.sql
│   └── app.ts                 # bootstrap do servidor
```

## Onde está cada padrão de projeto

| Padrão | Localização | Como funciona |
|---|---|---|
| **MVC** | `models/` + `controllers/` + `routes/` | Model guarda dado e regra própria; Controller só orquestra request/response; View é o JSON consumido pelo frontend React |
| **DAO** | `dao/*-dao-interface.ts` (contrato) + `dao/impl/` (SQLite) | Acesso a dado isolado atrás de interface — trocar a implementação não exige mudar regra de negócio |
| **Polimorfismo** | `interfaces/Ilendable.ts` + `models/book.ts` | `Book` é abstrata e implementa `Ilendable`; `Fisic`, `Ebook` e `Audiobook` sobrescrevem `calculateDueDateInDays()` e `calculateFine()` cada uma com sua regra |
| **Builder** | `builders/bookBuilder.ts`, `builders/userBuilder.ts` | Montagem passo a passo via métodos encadeados (`withTitle().withAuthor()...build()`) |
| **Factory Method** | Embutido em `bookBuilder.ts`, via `REGISTRY: Record<BookFormat, BookConstructor>` dentro do `build()` | Decide qual subclasse de `Book` instanciar a partir do formato, sem `switch/case` espalhado |
| **Command** | `command/command.ts` (`ICommand`) + `command/actions/*` + `command/command-factory.ts` | Cada operação de negócio é uma classe com `.execute()`; `CommandFactory` resolve qual Command rodar a partir de um registry, sem reflection |

## Regras de negócio principais

- Cada tipo de livro tem prazo de devolução próprio (`Fisic`, `Ebook`, `Audiobook`), calculado de forma polimórfica
- Apenas livros físicos geram multa por atraso
- Um livro físico só pode ser emprestado se houver exemplar disponível
- Toda operação relevante (cadastro, empréstimo, devolução) gera um registro em `ActivityEntry`, para auditoria

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/users` | Cadastrar usuário |
| `GET` | `/users` | Listar usuários |
| `POST` | `/auth/login` | Login |
| `GET` | `/books` | Listar livros |
| `POST` | `/books` | Cadastrar livro |
| `PUT` | `/books/:id` | Atualizar livro |
| `DELETE` | `/books/:id` | Remover livro |
| `GET` | `/loans` | Listar empréstimos |
| `POST` | `/loans` | Criar empréstimo |
| `POST` | `/loans/borrow` | Emprestar livro (usuário autenticado) |
| `POST` | `/loans/:id/return` | Devolver empréstimo |
| `GET` | `/activity` | Listar log de atividades recentes |

## Diagramas

Diagramas de classe (domínio e patterns) e de sequência (fluxo de cálculo de multa) foram gerados durante o desenvolvimento e estão disponíveis à parte, cobrindo:
- Hierarquia `Ilendable` → `Book` → `Fisic`/`Ebook`/`Audiobook`
- `BookBuilder`/`UserBuilder`, `ICommand`/`CommandFactory`, camada DAO
- Sequência completa de devolução com cálculo polimórfico de multa
