import * as ts from "typescript";
import { describe, expect, it } from "vitest";

import { includesModifier } from "./modifiers";

describe("includesModifier", () => {
	const abstractModifier = ts.factory.createModifier(
		ts.SyntaxKind.AbstractKeyword,
	);
	const readonlyModifier = ts.factory.createModifier(
		ts.SyntaxKind.ReadonlyKeyword,
	);

	it("returns false for undefined modifiers", () => {
		expect(includesModifier(undefined, ts.SyntaxKind.AbstractKeyword)).toBe(
			false,
		);
	});

	it("returns false for an empty iterable", () => {
		expect(includesModifier([], ts.SyntaxKind.AbstractKeyword)).toBe(false);
	});

	it("returns false when no modifier matches", () => {
		expect(
			includesModifier([readonlyModifier], ts.SyntaxKind.AbstractKeyword),
		).toBe(false);
	});

	it("finds a matching modifier after a non-matching one", () => {
		expect(
			includesModifier(
				[readonlyModifier, abstractModifier],
				ts.SyntaxKind.AbstractKeyword,
			),
		).toBe(true);
	});

	it("matches any of multiple requested modifier kinds", () => {
		expect(
			includesModifier(
				[readonlyModifier],
				ts.SyntaxKind.AbstractKeyword,
				ts.SyntaxKind.ReadonlyKeyword,
			),
		).toBe(true);
	});

	it("returns false when no modifier kinds are requested", () => {
		expect(includesModifier([abstractModifier])).toBe(false);
	});

	it("accepts an iterable other than an array", () => {
		expect(
			includesModifier(
				new Set([abstractModifier]),
				ts.SyntaxKind.AbstractKeyword,
			),
		).toBe(true);
	});

	it("ignores decorators when looking for modifiers", () => {
		const decorator = ts.factory.createDecorator(
			ts.factory.createIdentifier("sealed"),
		);
		expect(includesModifier([decorator], ts.SyntaxKind.AbstractKeyword)).toBe(
			false,
		);
	});
});
