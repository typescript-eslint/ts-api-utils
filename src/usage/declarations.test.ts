import { query } from "@phenomnomnominal/tsquery";
import * as ts from "typescript";
import { describe, expect, test } from "vitest";

import { createSourceFile } from "../test/utils";
import { DeclarationDomain, getDeclarationDomain } from "./declarations";

describe("getDeclarationDomain", () => {
	describe("imports", () => {
		test("default import", () => {
			const sourceFile = createSourceFile(`
				import Value from "./mod";
				import type Type from "./mod";
			`);

			const [valueId] = query<ts.Identifier>(
				sourceFile,
				"ImportClause > Identifier[name='Value']",
			);
			const [typeId] = query<ts.Identifier>(
				sourceFile,
				"ImportClause > Identifier[name='Type']",
			);

			expect(getDeclarationDomain(valueId)).toBe(
				DeclarationDomain.Any | DeclarationDomain.Import,
			);
			expect(getDeclarationDomain(typeId)).toBe(
				DeclarationDomain.Type | DeclarationDomain.Import,
			);
		});

		test("namespace import", () => {
			const sourceFile = createSourceFile(`
				import * as ValueNS from "./mod";
				import type * as TypeNS from "./mod";
			`);

			const [valueNsId] = query<ts.Identifier>(
				sourceFile,
				"NamespaceImport > Identifier[name='ValueNS']",
			);
			const [typeNsId] = query<ts.Identifier>(
				sourceFile,
				"NamespaceImport > Identifier[name='TypeNS']",
			);

			expect(getDeclarationDomain(valueNsId)).toBe(
				DeclarationDomain.Any | DeclarationDomain.Import,
			);
			expect(getDeclarationDomain(typeNsId)).toBe(
				DeclarationDomain.Type | DeclarationDomain.Import,
			);
		});

		test("named imports", () => {
			const sourceFile = createSourceFile(`
				import { Value, type Type } from "./mod";
				import type { ClauseType } from "./mod";
			`);

			const [valueId] = query<ts.Identifier>(
				sourceFile,
				"ImportSpecifier > Identifier[name='Value']",
			);
			const [typeId] = query<ts.Identifier>(
				sourceFile,
				"ImportSpecifier > Identifier[name='Type']",
			);
			const [clauseTypeId] = query<ts.Identifier>(
				sourceFile,
				"ImportSpecifier > Identifier[name='ClauseType']",
			);

			expect(getDeclarationDomain(valueId)).toBe(
				DeclarationDomain.Any | DeclarationDomain.Import,
			);
			expect(getDeclarationDomain(typeId)).toBe(
				DeclarationDomain.Type | DeclarationDomain.Import,
			);
			expect(getDeclarationDomain(clauseTypeId)).toBe(
				DeclarationDomain.Type | DeclarationDomain.Import,
			);
		});

		test("renamed named imports", () => {
			const sourceFile = createSourceFile(`
				import { OrigValue as LocalValue, type OrigType as LocalType } from "./mod";
				import type { OrigClause as LocalClause } from "./mod";
			`);

			const [origValueId] = query<ts.Identifier>(
				sourceFile,
				"ImportSpecifier > Identifier[name='OrigValue']",
			);
			const [localValueId] = query<ts.Identifier>(
				sourceFile,
				"ImportSpecifier > Identifier[name='LocalValue']",
			);
			const [origTypeId] = query<ts.Identifier>(
				sourceFile,
				"ImportSpecifier > Identifier[name='OrigType']",
			);
			const [localTypeId] = query<ts.Identifier>(
				sourceFile,
				"ImportSpecifier > Identifier[name='LocalType']",
			);
			const [origClauseId] = query<ts.Identifier>(
				sourceFile,
				"ImportSpecifier > Identifier[name='OrigClause']",
			);
			const [localClauseId] = query<ts.Identifier>(
				sourceFile,
				"ImportSpecifier > Identifier[name='LocalClause']",
			);

			expect(getDeclarationDomain(origValueId)).toBeUndefined();
			expect(getDeclarationDomain(localValueId)).toBe(
				DeclarationDomain.Any | DeclarationDomain.Import,
			);

			expect(getDeclarationDomain(origTypeId)).toBeUndefined();
			expect(getDeclarationDomain(localTypeId)).toBe(
				DeclarationDomain.Type | DeclarationDomain.Import,
			);

			expect(getDeclarationDomain(origClauseId)).toBeUndefined();
			expect(getDeclarationDomain(localClauseId)).toBe(
				DeclarationDomain.Type | DeclarationDomain.Import,
			);
		});

		test("import equals declaration", () => {
			const sourceFile = createSourceFile(`
				import Value = require("./mod");
				import type Type = require("./mod");
				import ValueAlias = NS.Value;
				import type TypeAlias = NS.Type;
			`);

			const [valueId] = query<ts.Identifier>(
				sourceFile,
				"ImportEqualsDeclaration > Identifier[name='Value']",
			);
			const [typeId] = query<ts.Identifier>(
				sourceFile,
				"ImportEqualsDeclaration > Identifier[name='Type']",
			);
			const [valueAliasId] = query<ts.Identifier>(
				sourceFile,
				"ImportEqualsDeclaration > Identifier[name='ValueAlias']",
			);
			const [typeAliasId] = query<ts.Identifier>(
				sourceFile,
				"ImportEqualsDeclaration > Identifier[name='TypeAlias']",
			);

			expect(getDeclarationDomain(valueId)).toBe(
				DeclarationDomain.Any | DeclarationDomain.Import,
			);
			expect(getDeclarationDomain(typeId)).toBe(
				DeclarationDomain.Type | DeclarationDomain.Import,
			);
			expect(getDeclarationDomain(valueAliasId)).toBe(
				DeclarationDomain.Any | DeclarationDomain.Import,
			);
			expect(getDeclarationDomain(typeAliasId)).toBe(
				DeclarationDomain.Type | DeclarationDomain.Import,
			);
		});
	});

	describe("other declarations", () => {
		test("class declaration and expression", () => {
			const sourceFile = createSourceFile(`
				class MyClass {}
				const expr = class NamedExpr {};
			`);

			const [classId] = query<ts.Identifier>(
				sourceFile,
				"ClassDeclaration > Identifier[name='MyClass']",
			);
			const [exprId] = query<ts.Identifier>(
				sourceFile,
				"ClassExpression > Identifier[name='NamedExpr']",
			);

			expect(getDeclarationDomain(classId)).toBe(
				DeclarationDomain.Type | DeclarationDomain.Value,
			);
			expect(getDeclarationDomain(exprId)).toBe(
				DeclarationDomain.Type | DeclarationDomain.Value,
			);
		});

		test("enum declaration", () => {
			const sourceFile = createSourceFile(`
				enum MyEnum {}
			`);

			const [enumId] = query<ts.Identifier>(
				sourceFile,
				"EnumDeclaration > Identifier[name='MyEnum']",
			);

			expect(getDeclarationDomain(enumId)).toBe(DeclarationDomain.Any);
		});

		test("function declaration and expression", () => {
			const sourceFile = createSourceFile(`
				function fnDecl() {}
				const expr = function fnExpr() {};
			`);

			const [fnDeclId] = query<ts.Identifier>(
				sourceFile,
				"FunctionDeclaration > Identifier[name='fnDecl']",
			);
			const [fnExprId] = query<ts.Identifier>(
				sourceFile,
				"FunctionExpression > Identifier[name='fnExpr']",
			);

			expect(getDeclarationDomain(fnDeclId)).toBe(DeclarationDomain.Value);
			expect(getDeclarationDomain(fnExprId)).toBe(DeclarationDomain.Value);
		});

		test("type declarations", () => {
			const sourceFile = createSourceFile(`
				interface MyInterface {}
				type MyType<T> = T;
			`);

			const [ifaceId] = query<ts.Identifier>(
				sourceFile,
				"InterfaceDeclaration > Identifier[name='MyInterface']",
			);
			const [typeId] = query<ts.Identifier>(
				sourceFile,
				"TypeAliasDeclaration > Identifier[name='MyType']",
			);
			const [typeParamId] = query<ts.Identifier>(
				sourceFile,
				"TypeParameter > Identifier[name='T']",
			);

			expect(getDeclarationDomain(ifaceId)).toBe(DeclarationDomain.Type);
			expect(getDeclarationDomain(typeId)).toBe(DeclarationDomain.Type);
			expect(getDeclarationDomain(typeParamId)).toBe(DeclarationDomain.Type);
		});

		test("module declaration", () => {
			const sourceFile = createSourceFile(`
				namespace MyNamespace {}
			`);

			const [nsId] = query<ts.Identifier>(
				sourceFile,
				"ModuleDeclaration > Identifier[name='MyNamespace']",
			);

			expect(getDeclarationDomain(nsId)).toBe(DeclarationDomain.Namespace);
		});

		test("variable declaration and binding elements", () => {
			const sourceFile = createSourceFile(`
				const a = 1;
				const { b } = { b: 2 };
			`);

			const [aId] = query<ts.Identifier>(
				sourceFile,
				"VariableDeclaration > Identifier[name='a']",
			);
			const [bId] = query<ts.Identifier>(
				sourceFile,
				"BindingElement > Identifier[name='b']",
			);

			expect(getDeclarationDomain(aId)).toBe(DeclarationDomain.Value);
			expect(getDeclarationDomain(bId)).toBe(DeclarationDomain.Value);
		});
	});
});
