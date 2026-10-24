// Code largely based on https://github.com/ajafff/tsutils
// Original license: https://github.com/ajafff/tsutils/blob/26b195358ec36d59f00333115aa3ffd9611ca78b/LICENSE

import * as ts from "typescript";

import {
	isModifierFlagSet,
	isNodeFlagSet,
	isObjectFlagSet,
	isSymbolFlagSet,
	isTransientSymbolLinksFlagSet,
	isTypeFlagSet,
} from "../flags";
import {
	isBindableObjectDefinePropertyCall,
	isInConstContext,
} from "../nodes/utilities";
import { isNumericPropertyName } from "../syntax";
import { getPropertyOfType } from "./getters";
import {
	isFalseLiteralType,
	isIntersectionType,
	isObjectType,
	isTupleTypeReference,
	isUnionType,
} from "./typeGuards";

/**
 * Get the intersection type parts of the given type.
 *
 * If the given type is not a intersection type, an array contain only that type will be returned.
 * @category Types - Utilities
 * @example
 * ```ts
 * declare const type: ts.Type;
 *
 * for (const constituent of intersectionConstituents(type)) {
 *   // ...
 * }
 * ```
 */
export function intersectionConstituents(type: ts.Type): ts.Type[] {
	return isIntersectionType(type) ? type.types : [type];
}

/**
 * Determines whether a type is definitely falsy. This function doesn't unwrap union types.
 * @category Types - Utilities
 * @example
 * ```ts
 * declare const type: ts.Type;
 *
 * if (isFalsyType(type)) {
 *   // ...
 * }
 * ```
 */
export function isFalsyType(type: ts.Type): boolean {
	if (
		isTypeFlagSet(
			type,
			ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void,
		)
	) {
		return true;
	}

	if (typeIsLiteral(type)) {
		if (typeof type.value === "object") {
			return type.value.base10Value === "0";
		} else {
			return !type.value;
		}
	}

	return isFalseLiteralType(type);
}

/**
 * Determines whether writing to a certain property of a given type is allowed.
 * @category Types - Utilities
 * @example
 * ```ts
 * declare const property: ts.Symbol;
 * declare const type: ts.Type;
 * declare const typeChecker: ts.TypeChecker;
 *
 * if (isPropertyReadonlyInType(type, property.getEscapedName(), typeChecker)) {
 *   // ...
 * }
 * ```
 */
export function isPropertyReadonlyInType(
	type: ts.Type,
	name: ts.__String,
	typeChecker: ts.TypeChecker,
): boolean {
	let seenProperty = false;
	let seenReadonlySignature = false;
	for (const subType of unionConstituents(type)) {
		if (getPropertyOfType(subType, name) === undefined) {
			// property is not present in this part of the union -> check for readonly index signature
			const index =
				(isNumericPropertyName(name)
					? typeChecker.getIndexInfoOfType(subType, ts.IndexKind.Number)
					: undefined) ??
				typeChecker.getIndexInfoOfType(subType, ts.IndexKind.String);
			if (index?.isReadonly) {
				if (seenProperty) {
					return true;
				}

				seenReadonlySignature = true;
			}
		} else if (
			seenReadonlySignature ||
			isReadonlyPropertyIntersection(subType, name, typeChecker)
		) {
			return true;
		} else {
			seenProperty = true;
		}
	}

	return false;
}

/**
 * Determines whether a type is thenable and thus can be used with `await`.
 * @category Types - Utilities
 * @example
 * ```ts
 * declare const node: ts.Node;
 * declare const type: ts.Type;
 * declare const typeChecker: ts.TypeChecker;
 *
 * if (isThenableType(typeChecker, node, type)) {
 *   // ...
 * }
 * ```
 */
export function isThenableType(
	typeChecker: ts.TypeChecker,
	node: ts.Node,
	type: ts.Type,
): boolean;
/**
 * Determines whether a type is thenable and thus can be used with `await`.
 * @category Types - Utilities
 * @example
 * ```ts
 * declare const expression: ts.Expression;
 * declare const typeChecker: ts.TypeChecker;
 *
 * if (isThenableType(typeChecker, expression)) {
 *   // ...
 * }
 * ```
 * @example
 * ```ts
 * declare const expression: ts.Expression;
 * declare const typeChecker: ts.TypeChecker;
 * declare const type: ts.Type;
 *
 * if (isThenableType(typeChecker, expression, type)) {
 *   // ...
 * }
 * ```
 */
export function isThenableType(
	typeChecker: ts.TypeChecker,
	node: ts.Expression,
	type?: ts.Type,
): boolean;
export function isThenableType(
	typeChecker: ts.TypeChecker,
	node: ts.Node,
	type = typeChecker.getTypeAtLocation(node),
): boolean {
	for (const constituent of unionConstituents(
		typeChecker.getApparentType(type),
	)) {
		const then = constituent.getProperty("then");
		if (then === undefined) {
			continue;
		}

		const thenType = typeChecker.getTypeOfSymbolAtLocation(then, node);
		for (const subConstituent of unionConstituents(thenType)) {
			for (const signature of subConstituent.getCallSignatures()) {
				if (
					signature.parameters.length !== 0 &&
					isCallback(typeChecker, signature.parameters[0], node)
				) {
					return true;
				}
			}
		}
	}

	return false;
}

/**
 * Get the intersection or union type parts of the given type.
 *
 * Note that this is a shallow collection: it only returns `type.types` or `[type]`.
 *
 * If the given type is not an intersection or union type, an array contain only that type will be returned.
 * @category Types - Utilities
 * @example
 * ```ts
 * declare const type: ts.Type;
 *
 * for (const constituent of typeConstituents(type)) {
 *   // ...
 * }
 * ```
 */
export function typeConstituents(type: ts.Type): ts.Type[] {
	return isIntersectionType(type) || isUnionType(type) ? type.types : [type];
}

/**
 * TS's `type.isLiteral()` is bugged before TS v5.0 and won't return `true` for
 * bigint literals. Use this function instead if you need to check for bigint
 * literals in TS versions before v5.0. Otherwise, you should just use
 * `type.isLiteral()`.
 * @see https://github.com/microsoft/TypeScript/pull/50929
 * @category Types - Utilities
 * @example
 * ```ts
 * declare const type: ts.Type;
 *
 * if (typeIsLiteral(type)) {
 *   // ...
 * }
 * ```
 */
export function typeIsLiteral(type: ts.Type): type is ts.LiteralType {
	return type.isLiteral();
}

/**
 * Get the union type parts of the given type.
 *
 * If the given type is not a union type, an array contain only that type will be returned.
 * @category Types - Utilities
 * @example
 * ```ts
 * declare const type: ts.Type;
 *
 * for (const constituent of unionConstituents(type)) {
 *   // ...
 * }
 * ```
 */
export function unionConstituents(type: ts.Type): ts.Type[] {
	return isUnionType(type) ? type.types : [type];
}

function isCallback(
	typeChecker: ts.TypeChecker,
	param: ts.Symbol,
	node: ts.Node,
): boolean {
	let type: ts.Type | undefined = typeChecker.getApparentType(
		typeChecker.getTypeOfSymbolAtLocation(param, node),
	);
	if ((param.valueDeclaration as ts.ParameterDeclaration).dotDotDotToken) {
		// unwrap array type of rest parameter
		type = type.getNumberIndexType();
		if (type === undefined) {
			return false;
		}
	}

	for (const subType of unionConstituents(type)) {
		if (subType.getCallSignatures().length !== 0) {
			return true;
		}
	}

	return false;
}

/**
 * Returns true for `Object.defineProperty(o, 'prop', {value, writable: false})` and `Object.defineProperty(o, 'prop', {get: () => 1})`
 * @category Types - Utilities
 * @example
 * ```ts
 * declare const node: ts.CallExpression;
 * declare const typeChecker: ts.TypeChecker;
 *
 * if (isReadonlyAssignmentDeclaration(node, typeChecker)) {
 *   // ...
 * }
 * ```
 */
function isReadonlyAssignmentDeclaration(
	node: ts.CallExpression,
	typeChecker: ts.TypeChecker,
) {
	if (!isBindableObjectDefinePropertyCall(node)) {
		return false;
	}

	const descriptorType = typeChecker.getTypeAtLocation(node.arguments[2]);
	if (descriptorType.getProperty("value") === undefined) {
		return descriptorType.getProperty("set") === undefined;
	}

	const writableProp = descriptorType.getProperty("writable");
	if (writableProp === undefined) {
		return false;
	}

	const writableType =
		writableProp.valueDeclaration !== undefined &&
		ts.isPropertyAssignment(writableProp.valueDeclaration)
			? typeChecker.getTypeAtLocation(writableProp.valueDeclaration.initializer)
			: typeChecker.getTypeOfSymbolAtLocation(writableProp, node.arguments[2]);
	return isFalseLiteralType(writableType);
}

function isReadonlyPropertyFromMappedType(
	type: ts.Type,
	name: ts.__String,
	typeChecker: ts.TypeChecker,
): boolean | undefined {
	if (!isObjectType(type) || !isObjectFlagSet(type, ts.ObjectFlags.Mapped)) {
		return;
	}

	const declaration = type.symbol.declarations![0] as ts.MappedTypeNode;
	// well-known symbols are not affected by mapped types
	if (
		declaration.readonlyToken !== undefined &&
		!/^__@[^@]+$/.test(name as string)
	) {
		return declaration.readonlyToken.kind !== ts.SyntaxKind.MinusToken;
	}

	const { modifiersType } = type as { modifiersType?: ts.Type };

	return (
		modifiersType && isPropertyReadonlyInType(modifiersType, name, typeChecker)
	);
}

function isReadonlyPropertyIntersection(
	type: ts.Type,
	name: ts.__String,
	typeChecker: ts.TypeChecker,
) {
	const constituents = intersectionConstituents(type);
	return constituents.some((constituent): boolean => {
		const prop = getPropertyOfType(constituent, name);
		if (prop === undefined) {
			return false;
		}

		if (prop.flags & ts.SymbolFlags.Transient) {
			if (
				/^(?:[1-9]\d*|0)$/.test(name as string) &&
				isTupleTypeReference(constituent)
			) {
				return constituent.target.readonly;
			}

			switch (
				isReadonlyPropertyFromMappedType(constituent, name, typeChecker)
			) {
				case false:
					return false;
				case true:
					return true;
				default:
				// `undefined` falls through
			}

			if (
				(prop as ts.TransientSymbol).links &&
				isTransientSymbolLinksFlagSet(
					(prop as ts.TransientSymbol).links,
					ts.CheckFlags.Readonly,
				)
			) {
				return true;
			}
		}

		return (
			// members of namespace import
			isSymbolFlagSet(prop, ts.SymbolFlags.ValueModule) ||
			// we unwrapped every mapped type, now we can check the actual declarations
			symbolHasReadonlyDeclaration(prop, typeChecker)
		);
	});
}

/**
 * Test if the given symbol has a readonly declaration.
 */
function symbolHasReadonlyDeclaration(
	symbol: ts.Symbol,
	typeChecker: ts.TypeChecker,
): boolean {
	return !!(
		(symbol.flags & ts.SymbolFlags.Accessor) === ts.SymbolFlags.GetAccessor ||
		symbol.declarations?.some(
			(node) =>
				isModifierFlagSet(node, ts.ModifierFlags.Readonly) ||
				(ts.isVariableDeclaration(node) &&
					isNodeFlagSet(node.parent, ts.NodeFlags.Const)) ||
				(ts.isCallExpression(node) &&
					isReadonlyAssignmentDeclaration(node, typeChecker)) ||
				ts.isEnumMember(node) ||
				((ts.isPropertyAssignment(node) ||
					ts.isShorthandPropertyAssignment(node)) &&
					isInConstContext(node, typeChecker)),
		)
	);
}
