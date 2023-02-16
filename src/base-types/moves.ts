import {
	type RulesetClassic,
	type RulesetStarforged,
	type Abstract,
	type Localize,
	type Players,
	type Attributes
} from '@base-types'
import { type ExtendMany } from 'base-types/abstract'

export type MoveID = string

export type RollType = 'action_roll' | 'progress_roll'

export type MoveCategoryID = string
export interface MoveCategory
	extends Abstract.Collection<Move<RollType>, MoveCategoryID> {}

export interface Move<T extends RollType = RollType>
	extends Abstract.Node<MoveID> {
	name: Localize.Label
	progress_move?: T extends 'progress_roll' ? true : false
	attributes?: Record<string, Attributes.Attribute>
	text: Localize.MarkdownParagraphs
	outcomes: MoveOutcomes
	trigger: Trigger<T>
}

export interface MoveExtension extends ExtendMany<Move> {}

export type MoveOutcomeType = 'miss' | 'weak_hit' | 'strong_hit'

export interface MoveOutcome {
	text: Localize.MarkdownParagraph
	count_as?: MoveOutcomeType
	reroll?: MoveReroll
}

// TODO: would match outcomes make sense as ExtendOne?
export interface MoveOutcomeMatchable extends MoveOutcome {
	match?: MoveOutcome
}
export interface MoveOutcomes extends Record<MoveOutcomeType, MoveOutcome> {
	miss: MoveOutcomeMatchable
	weak_hit: MoveOutcome
	strong_hit: MoveOutcomeMatchable
}

export interface Trigger<T extends RollType = RollType> {
	text: Localize.MarkdownPhrase
	options?: Array<TriggerOption<T>>
	by: TriggerBy
}

export interface MoveReroll {
	text?: Localize.MarkdownPhrase
	method: MoveRerollMethod
}

export interface TriggerBy {
	player: boolean
	ally: boolean
}

export type MoveRerollMethod =
	| 'any'
	| 'all'
	| 'challenge_die'
	| 'challenge_dice'
	| 'action_die'
export type RollMethod = 'any' | 'all' | 'highest' | 'lowest' | 'inherit'

export type ProgressType =
	| RulesetStarforged.ProgressType
	| RulesetClassic.ProgressType

export type RollableStatID =
	| Players.StatID
	| Players.ConditionMeterID
	| RulesetStarforged.ConditionMeterAlias
	| RulesetClassic.ConditionMeterAlias

export type Rollable<T extends RollType = RollType> = T extends 'progress_roll'
	? T extends 'action_roll'
		? // if it's a union, allow both types:
		  ProgressType | RollableStatID
		: // otherwise, restrict types as appropriate:
		  ProgressType
	: RollableStatID

export interface TriggerOption<T extends RollType = RollType> {
	text?: Localize.MarkdownPhrase
	method: RollMethod | MoveOutcomeType
	roll_type: T
	using: Array<Rollable<T>>
}
