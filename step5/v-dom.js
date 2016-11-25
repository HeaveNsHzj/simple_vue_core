
import { init } from 'snabbdom'
import classes from 'snabbdom/modules/class'
import style from 'snabbdom/modules/style'
import prop from 'snabbdom/modules/props'
import attributes from 'snabbdom/modules/attributes'
import events from 'snabbdom/modules/eventlisteners'
import dataset from 'snabbdom/modules/dataset'
import hero from 'snabbdom/modules/hero'
import h from 'snabbdom/h'

export const createElement = h
export const patch = init([attributes, classes, style, prop, events, dataset, hero])