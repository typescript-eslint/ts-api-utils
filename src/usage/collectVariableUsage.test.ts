import { query } from "@phenomnomnominal/tsquery";
import * as ts from "typescript";
import { describe, expect, test } from "vitest";

import { createSourceFile } from "../test/utils";
import { collectVariableUsage } from "./collectVariableUsage";
import { DeclarationDomain } from "./declarations";
import { UsageDomain } from "./getUsageDomain";

describe("collectVariableUsage", () => {
	test("conditional type", () => {
		const sourceFile = createSourceFile(`
			export type TrueIfZero<T> = T extends 0 ? true : false;
		`);

		const [nameIdentifier] = query(sourceFile, "Identifier");
		const [typeParameterIdentifier] = query(
			sourceFile,
			"TypeParameter Identifier",
		);

		const [conditionalTypeReferenceIdentifier] = query(
			sourceFile,
			"ConditionalType TypeReference Identifier",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual).toEqual(
			new Map([
				[
					nameIdentifier,
					{
						declarations: [nameIdentifier],
						domain: DeclarationDomain.Type,
						exported: true,
						inGlobalScope: false,
						uses: [],
					},
				],
				[
					typeParameterIdentifier,
					{
						declarations: [typeParameterIdentifier],
						domain: DeclarationDomain.Type,
						exported: false,
						inGlobalScope: false,
						uses: [
							{
								domain: DeclarationDomain.Type,
								location: conditionalTypeReferenceIdentifier,
							},
						],
					},
				],
			]),
		);
	});

	test("class declaration and property", () => {
		const sourceFile = createSourceFile(`
			class Box {
				value = 1;
			}

			export const { value } = new Box();
		`);

		const [classDeclaration] = query<ts.ClassDeclaration>(
			sourceFile,
			"ClassDeclaration",
		);

		const [variableDeclaration] = query(sourceFile, "VariableDeclaration");

		const [variableIdentifier] = query(
			variableDeclaration,
			"ObjectBindingPattern Identifier",
		);

		const [newIdentifier] = query(
			variableDeclaration,
			"NewExpression Identifier",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual).toEqual(
			new Map([
				[
					classDeclaration.name,
					{
						declarations: [classDeclaration.name],
						domain: DeclarationDomain.Type | DeclarationDomain.Value,
						exported: false,
						inGlobalScope: false,
						uses: [
							{
								domain: UsageDomain.ValueOrNamespace,
								location: newIdentifier,
							},
						],
					},
				],
				[
					variableIdentifier,
					{
						declarations: [variableIdentifier],
						domain: DeclarationDomain.Value,
						exported: true,
						inGlobalScope: false,
						uses: [],
					},
				],
			]),
		);
	});

	test("class expression and property", () => {
		const sourceFile = createSourceFile(`
			const Box = class {
				value = 1;
			}

			export const { value } = new Box();
		`);

		const [classNameIdentifier] = query(
			sourceFile,
			"VariableDeclaration Identifier",
		);

		const [usageVariableDeclaration] = query(
			sourceFile,
			"VariableStatement:has(ExportKeyword) VariableDeclaration",
		);

		const [variableIdentifier] = query(
			usageVariableDeclaration,
			"ObjectBindingPattern Identifier",
		);

		const [newIdentifier] = query(
			usageVariableDeclaration,
			"NewExpression Identifier",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual).toEqual(
			new Map([
				[
					classNameIdentifier,
					{
						declarations: [classNameIdentifier],
						domain: DeclarationDomain.Value,
						exported: false,
						inGlobalScope: false,
						uses: [
							{
								domain: UsageDomain.ValueOrNamespace,
								location: newIdentifier,
							},
						],
					},
				],
				[
					variableIdentifier,
					{
						declarations: [variableIdentifier],
						domain: DeclarationDomain.Value,
						exported: true,
						inGlobalScope: false,
						uses: [],
					},
				],
			]),
		);
	});

	test("enum declaration and property", () => {
		const sourceFile = createSourceFile(`
			enum Values { First }
			Values.First;
		`);

		const [enumIdentifier] = query(sourceFile, "EnumDeclaration Identifier");

		const [propertyReference] = query(
			sourceFile,
			"ExpressionStatement Identifier",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual).toEqual(
			new Map([
				[
					enumIdentifier,
					{
						declarations: [enumIdentifier],
						domain: DeclarationDomain.Any,
						exported: false,
						inGlobalScope: true,
						uses: [
							{
								domain: UsageDomain.ValueOrNamespace,
								location: propertyReference,
							},
						],
					},
				],
			]),
		);
	});

	test("function declaration and call", () => {
		const sourceFile = createSourceFile(`
			function createValue() {
				return 123;
			}

			createValue();
		`);

		const [functionDeclaration] = query(
			sourceFile,
			"FunctionDeclaration Identifier",
		);

		const [callExpressionIdentifier] = query(
			sourceFile,
			"CallExpression Identifier",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual).toEqual(
			new Map([
				[
					functionDeclaration,
					{
						declarations: [functionDeclaration],
						domain: DeclarationDomain.Value,
						exported: false,
						inGlobalScope: true,
						uses: [
							{
								domain: UsageDomain.ValueOrNamespace,
								location: callExpressionIdentifier,
							},
						],
					},
				],
			]),
		);
	});

	test("namespace and property", () => {
		const sourceFile = createSourceFile(`
			namespace Values { export const First = 0 }
			Values.First;
		`);

		const [namespaceIdentifier] = query(
			sourceFile,
			"ModuleDeclaration Identifier",
		);

		const [variableIdentifier] = query(
			sourceFile,
			"VariableDeclaration Identifier",
		);

		const [propertyReference] = query(
			sourceFile,
			"ExpressionStatement Identifier",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual).toEqual(
			new Map([
				[
					namespaceIdentifier,
					{
						declarations: [namespaceIdentifier],
						domain: DeclarationDomain.Namespace | DeclarationDomain.Value,
						exported: false,
						inGlobalScope: true,
						uses: [
							{
								domain: UsageDomain.ValueOrNamespace,
								location: propertyReference,
							},
						],
					},
				],
				[
					variableIdentifier,
					{
						declarations: [variableIdentifier],
						domain: DeclarationDomain.Value,
						exported: true,
						inGlobalScope: false,
						uses: [],
					},
				],
			]),
		);
	});

	test("nested Namespace and property", () => {
		const sourceFile = createSourceFile(`
			namespace Outer {
				export namespace Inner {
					export const First = 0;
				}
			}

			Outer.Inner.First;
		`);

		const [namespaceIdentifierOuter] = query(
			sourceFile,
			"ModuleDeclaration Identifier",
		);

		const [namespaceIdentifierInner] = query(
			sourceFile,
			"ModuleDeclaration ModuleDeclaration Identifier",
		);

		const [variableIdentifier] = query(
			sourceFile,
			"VariableDeclaration Identifier",
		);

		const [propertyReference] = query(
			sourceFile,
			"ExpressionStatement Identifier",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual).toEqual(
			new Map([
				[
					namespaceIdentifierInner,
					{
						declarations: [namespaceIdentifierInner],
						domain: DeclarationDomain.Namespace,
						exported: true,
						inGlobalScope: false,
						uses: [],
					},
				],
				[
					namespaceIdentifierOuter,
					{
						declarations: [namespaceIdentifierOuter],
						domain: DeclarationDomain.Namespace | DeclarationDomain.Value,
						exported: false,
						inGlobalScope: true,
						uses: [
							{
								domain: UsageDomain.ValueOrNamespace,
								location: propertyReference,
							},
						],
					},
				],
				[
					variableIdentifier,
					{
						declarations: [variableIdentifier],
						domain: DeclarationDomain.Value,
						exported: true,
						inGlobalScope: false,
						uses: [],
					},
				],
			]),
		);
	});

	test("variable reference", () => {
		const sourceFile = createSourceFile(`
			let value = 123;
			value;
		`);

		const [variableIdentifier] = query(
			sourceFile,
			"VariableDeclaration Identifier",
		);

		const [variableReference] = query(
			sourceFile,
			"ExpressionStatement Identifier",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual).toEqual(
			new Map([
				[
					variableIdentifier,
					{
						declarations: [variableIdentifier],
						domain: DeclarationDomain.Value,
						exported: false,
						inGlobalScope: true,
						uses: [
							{
								domain: UsageDomain.ValueOrNamespace,
								location: variableReference,
							},
						],
					},
				],
			]),
		);
	});

	test("variable reference in a block", () => {
		const sourceFile = createSourceFile(`
			let value = 123;
			
			{
				value;
			}
		`);

		const [variableIdentifier] = query(
			sourceFile,
			"VariableDeclaration Identifier",
		);

		const [variableReference] = query(
			sourceFile,
			"ExpressionStatement Identifier",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual).toEqual(
			new Map([
				[
					variableIdentifier,
					{
						declarations: [variableIdentifier],
						domain: DeclarationDomain.Value,
						exported: false,
						inGlobalScope: true,
						uses: [
							{
								domain: UsageDomain.ValueOrNamespace,
								location: variableReference,
							},
						],
					},
				],
			]),
		);
	});

	test("variable with a reference inside a class", () => {
		const sourceFile = createSourceFile(`
			let value = 123;

			class Getter {
				getValue = () => value;
			}
		`);

		const [variableIdentifier] = query(
			sourceFile,
			"VariableDeclaration Identifier",
		);

		const [classDeclaration] = query<ts.ClassDeclaration>(
			sourceFile,
			"ClassDeclaration",
		);

		const [variableReference] = query(
			classDeclaration,
			"ArrowFunction Identifier",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual).toEqual(
			new Map([
				[
					classDeclaration.name,
					{
						declarations: [classDeclaration.name],
						domain: DeclarationDomain.Type | DeclarationDomain.Value,
						exported: false,
						inGlobalScope: true,
						uses: [],
					},
				],
				[
					variableIdentifier,
					{
						declarations: [variableIdentifier],
						domain: DeclarationDomain.Value,
						exported: false,
						inGlobalScope: true,
						uses: [
							{
								domain: UsageDomain.ValueOrNamespace,
								location: variableReference,
							},
						],
					},
				],
			]),
		);
	});

	test("type-only import specifiers", () => {
		const sourceFile = createSourceFile(`
			import { type TypeOnly, Value } from "./mod";
			import type { ClauseTypeOnly } from "./mod";

			type T = TypeOnly;
			type C = ClauseTypeOnly;
			const v = Value;
		`);

		const [typeOnlyDeclaration] = query<ts.Identifier>(
			sourceFile,
			"ImportSpecifier > Identifier[name='TypeOnly']",
		);
		const [valueDeclaration] = query<ts.Identifier>(
			sourceFile,
			"ImportSpecifier > Identifier[name='Value']",
		);
		const [clauseTypeDeclaration] = query<ts.Identifier>(
			sourceFile,
			"ImportSpecifier > Identifier[name='ClauseTypeOnly']",
		);

		const [typeOnlyUse] = query<ts.Identifier>(
			sourceFile,
			"TypeAliasDeclaration:has(Identifier[name='T']) TypeReference Identifier[name='TypeOnly']",
		);
		const [clauseTypeUse] = query<ts.Identifier>(
			sourceFile,
			"TypeAliasDeclaration:has(Identifier[name='C']) TypeReference Identifier[name='ClauseTypeOnly']",
		);
		const [valueUse] = query<ts.Identifier>(
			sourceFile,
			"VariableDeclaration:has(Identifier[name='v']) Identifier[name='Value']",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual.get(typeOnlyDeclaration)).toEqual({
			declarations: [typeOnlyDeclaration],
			domain: DeclarationDomain.Type | DeclarationDomain.Import,
			exported: false,
			inGlobalScope: false,
			uses: [
				{
					domain: UsageDomain.Type,
					location: typeOnlyUse,
				},
			],
		});

		expect(actual.get(clauseTypeDeclaration)).toEqual({
			declarations: [clauseTypeDeclaration],
			domain: DeclarationDomain.Type | DeclarationDomain.Import,
			exported: false,
			inGlobalScope: false,
			uses: [
				{
					domain: UsageDomain.Type,
					location: clauseTypeUse,
				},
			],
		});

		expect(actual.get(valueDeclaration)).toEqual({
			declarations: [valueDeclaration],
			domain: DeclarationDomain.Any | DeclarationDomain.Import,
			exported: false,
			inGlobalScope: false,
			uses: [
				{
					domain: UsageDomain.ValueOrNamespace,
					location: valueUse,
				},
			],
		});
	});

	test("type-only default and import equals declarations", () => {
		const sourceFile = createSourceFile(`
			import type DefaultType from "./mod";
			import type TypeEquals = require("./mod");

			type D = DefaultType;
			type E = TypeEquals;
		`);

		const [defaultTypeDeclaration] = query<ts.Identifier>(
			sourceFile,
			"ImportClause > Identifier[name='DefaultType']",
		);
		const [typeEqualsDeclaration] = query<ts.Identifier>(
			sourceFile,
			"ImportEqualsDeclaration > Identifier[name='TypeEquals']",
		);

		const [defaultTypeUse] = query<ts.Identifier>(
			sourceFile,
			"TypeAliasDeclaration:has(Identifier[name='D']) TypeReference Identifier[name='DefaultType']",
		);
		const [typeEqualsUse] = query<ts.Identifier>(
			sourceFile,
			"TypeAliasDeclaration:has(Identifier[name='E']) TypeReference Identifier[name='TypeEquals']",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual.get(defaultTypeDeclaration)).toEqual({
			declarations: [defaultTypeDeclaration],
			domain: DeclarationDomain.Type | DeclarationDomain.Import,
			exported: false,
			inGlobalScope: false,
			uses: [
				{
					domain: UsageDomain.Type,
					location: defaultTypeUse,
				},
			],
		});

		expect(actual.get(typeEqualsDeclaration)).toEqual({
			declarations: [typeEqualsDeclaration],
			domain: DeclarationDomain.Type | DeclarationDomain.Import,
			exported: false,
			inGlobalScope: false,
			uses: [
				{
					domain: UsageDomain.Type,
					location: typeEqualsUse,
				},
			],
		});
	});

	test("type-only import does not match value usage", () => {
		const sourceFile = createSourceFile(`
			import type { Foo } from "./mod";

			const x = Foo;
		`);

		const [fooDeclaration] = query<ts.Identifier>(
			sourceFile,
			"ImportSpecifier > Identifier[name='Foo']",
		);

		const actual = collectVariableUsage(sourceFile);

		expect(actual.get(fooDeclaration)).toEqual({
			declarations: [fooDeclaration],
			domain: DeclarationDomain.Type | DeclarationDomain.Import,
			exported: false,
			inGlobalScope: false,
			uses: [],
		});
	});
});
