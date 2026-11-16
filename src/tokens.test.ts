import * as ts from "typescript";
import { describe, expect, it, vitest } from "vitest";

import { createNodeAndSourceFile } from "./test/utils";
import { forEachToken, iterateTokens } from "./tokens";

describe("iterateTokens", () => {
	it("Should iterate all tokens", () => {
		const { node, sourceFile } = createNodeAndSourceFile("let value;");
		const generator = iterateTokens(node, sourceFile);
		expect(typeof generator[Symbol.iterator]).toBe("function");

		const tokens = [...generator];
		expect(tokens.length).toBe(3);
		expect(tokens.every((token) => ts.isTokenKind(token.kind))).toBe(true);
		expect(generator.next()).toEqual({ done: true, value: undefined });
	});

	it("Should preserve source order for nested nodes", () => {
		const { node } = createNodeAndSourceFile("const value = call(1 + 2);");

		expect([...iterateTokens(node)].map((token) => token.getText())).toEqual([
			"const",
			"value",
			"=",
			"call",
			"(",
			"1",
			"+",
			"2",
			")",
			";",
		]);
	});

	it("Should yield a token node directly", () => {
		const sourceFile = ts.createSourceFile(
			"file.ts",
			"identifier",
			ts.ScriptTarget.Latest,
			true,
		);
		const token = sourceFile.getFirstToken()!;

		expect([...iterateTokens(token, sourceFile)]).toEqual([token]);
	});
});

describe("forEachToken", () => {
	it("Should iterate all tokens", () => {
		const { node, sourceFile } = createNodeAndSourceFile("let value;");
		const callback = vitest.fn();

		forEachToken(node, callback, sourceFile);

		expect(callback).toBeCalledTimes(3);
	});

	it("Should use the node source file by default", () => {
		const { node } = createNodeAndSourceFile("let value = 1;");
		const tokens: ts.Node[] = [];

		forEachToken(node, (token) => tokens.push(token));

		expect(tokens.map((token) => token.getText())).toEqual([
			"let",
			"value",
			"=",
			"1",
			";",
		]);
	});
});
