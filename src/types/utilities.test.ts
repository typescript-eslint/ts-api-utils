import * as ts from "typescript";
import { describe, expect, it } from "vitest";

import { createSourceFileAndTypeChecker } from "../test/utils";
import {
	isFalsyType,
	isPropertyReadonlyInType,
	isThenableType,
} from "./utilities";

describe("isPropertyReadonlyInType", () => {
	it("returns false when the property is not readonly", () => {
		const { sourceFile, typeChecker } = createSourceFileAndTypeChecker(`
			interface Box {
				 value: string;
			};
		`);
		const node = sourceFile.statements[0] as ts.InterfaceDeclaration;
		const type = typeChecker.getTypeAtLocation(node);

		expect(
			isPropertyReadonlyInType(
				type,
				ts.escapeLeadingUnderscores("value"),
				typeChecker,
			),
		).toBe(false);
	});

	it("returns true when the property is readonly", () => {
		const { sourceFile, typeChecker } = createSourceFileAndTypeChecker(`
			interface Box {
				readonly value: string;
			};
		`);
		const node = sourceFile.statements[0] as ts.InterfaceDeclaration;
		const type = typeChecker.getTypeAtLocation(node);

		expect(
			isPropertyReadonlyInType(
				type,
				ts.escapeLeadingUnderscores("value"),
				typeChecker,
			),
		).toBe(true);
	});

	it.each([
		["Partial<Readonly<Box>>", true],
		["Partial<Box>", false],
	])(
		"reads %s from its properties' check flags without a modifiers type",
		(typeText, expected) => {
			const { sourceFile, typeChecker } = createSourceFileAndTypeChecker(`
				interface Box {
					value: string;
				}
				type Test = ${typeText};
			`);
			const node = sourceFile.statements.at(-1) as ts.TypeAliasDeclaration;
			const type = typeChecker.getTypeAtLocation(node);
			type.getProperties();
			Object.defineProperty(type, "modifiersType", {
				value: undefined,
				writable: true,
			});

			expect(
				isPropertyReadonlyInType(
					type,
					ts.escapeLeadingUnderscores("value"),
					typeChecker,
				),
			).toBe(expected);
		},
	);

	it("does not crash when the type is a mapped type parameter extending any", () => {
		const { sourceFile, typeChecker } = createSourceFileAndTypeChecker(`
			type MyType<T> = {
				[K in keyof T]: 'cat' | 'dog' | T[K];
			};
			type Test<A extends any[]> = MyType<A>;
		`);
		const node = sourceFile.statements.at(-1) as ts.TypeAliasDeclaration;
		const type = typeChecker.getTypeAtLocation(node);

		expect(
			isPropertyReadonlyInType(
				type,
				ts.escapeLeadingUnderscores("length"),
				typeChecker,
			),
		).toBe(false);
	});

	it("does not crash when the property is inside a readonly array of a generic arrow function parameter", () => {
		const { sourceFile, typeChecker } = createSourceFileAndTypeChecker(`
			declare const factory: <T>(x: readonly T[]) => (f: (x: T) => void) => void;

			factory([{ abc: 42 }])((x) => { });
		`);
		const node = sourceFile.statements.at(-1) as ts.ExpressionStatement;
		const call = node.expression as ts.CallExpression;
		const parameter = call.arguments[0] as ts.ArrowFunction;
		const type = typeChecker.getTypeAtLocation(parameter.parameters[0]);

		expect(
			isPropertyReadonlyInType(
				type,
				ts.escapeLeadingUnderscores("abc"),
				typeChecker,
			),
		).toBe(false);
	});
});

describe("isFalsyType", () => {
	it.each([
		[false, "{}"],
		[false, "true"],
		[false, '"_"'],
		[true, '""'],
		[true, "false"],
		[true, "0"],
		[true, "null"],
		[true, "0n"],
		[true, "-0n"],
		[false, "24n"],
	])("returns %j when given %s", (expected, source) => {
		const { sourceFile, typeChecker } = createSourceFileAndTypeChecker(`
			${source};
		`);
		const node = sourceFile.statements.at(-1) as ts.ExpressionStatement;
		const type = typeChecker.getTypeAtLocation(node.expression);

		expect(isFalsyType(type)).toBe(expected);
	});
});

describe("isThenableType", () => {
	it.each([
		[false, "{}"],
		[false, "{ then: () => {}, }"],
		[true, "{ then: (next: () => void ) => next(), }"],
		[true, "new Promise(() => {})"],
	])("returns %j when given %s", (expected, source) => {
		const { sourceFile, typeChecker } = createSourceFileAndTypeChecker(`
			const value = ${source};
			value;
		`);
		const node = sourceFile.statements.at(-1) as ts.ExpressionStatement;
		const type = typeChecker.getTypeAtLocation(node.expression);

		expect(isThenableType(typeChecker, node, type)).toBe(expected);
	});
});
