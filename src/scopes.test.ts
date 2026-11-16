import * as ts from "typescript";
import { describe, expect, it } from "vitest";

import { isFunctionScopeBoundary } from "./scopes";
import { createSourceFile } from "./test/utils";

const boundaryKinds = [
	ts.SyntaxKind.ArrowFunction,
	ts.SyntaxKind.CallSignature,
	ts.SyntaxKind.ClassDeclaration,
	ts.SyntaxKind.ClassExpression,
	ts.SyntaxKind.Constructor,
	ts.SyntaxKind.ConstructorType,
	ts.SyntaxKind.ConstructSignature,
	ts.SyntaxKind.EnumDeclaration,
	ts.SyntaxKind.FunctionDeclaration,
	ts.SyntaxKind.FunctionExpression,
	ts.SyntaxKind.FunctionType,
	ts.SyntaxKind.GetAccessor,
	ts.SyntaxKind.MethodDeclaration,
	ts.SyntaxKind.MethodSignature,
	ts.SyntaxKind.ModuleDeclaration,
	ts.SyntaxKind.SetAccessor,
] as const;

function collectNodes(sourceFile: ts.SourceFile): ts.Node[] {
	const nodes: ts.Node[] = [];

	function visit(node: ts.Node): void {
		nodes.push(node);
		node.forEachChild(visit);
	}

	visit(sourceFile);
	return nodes;
}

describe("isFunctionScopeBoundary", () => {
	it("returns true for each function scope boundary kind", () => {
		const sourceFile = createSourceFile(`
			class Declaration {
				constructor() {}
				get value() { return 1; }
				set value(value: number) {}
				method() {}
			}
			const ClassExpression = class {};
			enum Example { Value }
			function declaration() {}
			const expression = function () {};
			const arrow = () => {};
			namespace ExampleNamespace {}
			interface Callable {
				(): void;
				new (): Callable;
				method(): void;
			}
			type ConstructorType = new () => Callable;
			type FunctionType = () => void;
		`);
		const nodes = collectNodes(sourceFile);

		for (const kind of boundaryKinds) {
			const node = nodes.find((candidate) => candidate.kind === kind);
			expect(node).toBeDefined();
			expect(isFunctionScopeBoundary(node!)).toBe(true);
		}
	});

	it("returns true for an external module source file", () => {
		const sourceFile = createSourceFile("export const value = 1;");

		expect(isFunctionScopeBoundary(sourceFile)).toBe(true);
	});

	it("returns false for a script source file", () => {
		const sourceFile = createSourceFile("const value = 1;");

		expect(isFunctionScopeBoundary(sourceFile)).toBe(false);
	});

	it("returns false for nodes that do not create a function scope", () => {
		const sourceFile = createSourceFile("if (true) { const value = 1; }");
		const block = collectNodes(sourceFile).find(ts.isBlock);

		expect(block).toBeDefined();
		expect(isFunctionScopeBoundary(block!)).toBe(false);
	});
});
