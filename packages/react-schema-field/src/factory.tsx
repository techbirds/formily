import React, { useContext, Fragment } from 'react'
import { isSchemaObject, Schema } from '@formily/json-schema'
import { RecursionField } from './components'
import {
  render,
  SchemaMarkupContext,
  SchemaExpressionScopeContext,
  SchemaOptionsContext
} from './shared'
import {
  ReactComponentPath,
  JSXComponent,
  ISchemaFieldFactoryOptions,
  SchemaComponents,
  ISchemaFieldProps,
  ISchemaMarkupFieldProps,
  ISchemaTypeFieldProps
} from './types'

const env = {
  nonameId: 0
}

const getRandomName = () => {
  return `NO_NAME_FIELD_$${env.nonameId++}`
}

export function createSchemaField<Components extends SchemaComponents>(
  options: ISchemaFieldFactoryOptions<Components>
) {
  function SchemaField<
    Decorator extends JSXComponent,
    Component extends JSXComponent
  >(props: ISchemaFieldProps<Decorator, Component>) {
    const schema = isSchemaObject(props.schema)
      ? props.schema
      : new Schema({
          type: 'object',
          ...props.schema
        })

    const renderMarkup = () => {
      env.nonameId = 0
      return render(
        <SchemaMarkupContext.Provider value={schema}>
          {props.children}
        </SchemaMarkupContext.Provider>
      )
    }

    const renderChildren = () => {
      return (
        <SchemaExpressionScopeContext.Provider value={props.scope}>
          <RecursionField {...props} schema={schema} />
        </SchemaExpressionScopeContext.Provider>
      )
    }

    return (
      <SchemaOptionsContext.Provider value={options}>
        {renderMarkup()}
        {renderChildren()}
      </SchemaOptionsContext.Provider>
    )
  }

  SchemaField.displayName = 'SchemaField'
  function MarkupField<
    Decorator extends ReactComponentPath<Components>,
    Component extends ReactComponentPath<Components>
  >(
    props: ISchemaMarkupFieldProps<Components, Component, Decorator>
  ): React.ReactElement {
    const parent = useContext(SchemaMarkupContext)
    if (!parent) return <Fragment />
    const renderChildren = () => {
      if (props?.type === 'array') {
        return <MarkupField type="object">{props.children}</MarkupField>
      }
      return <React.Fragment>{props.children}</React.Fragment>
    }
    const name = props.name || getRandomName()
    if (parent.type === 'object' || parent.type === 'void') {
      const schema = parent.addProperty(name, props)
      return (
        <SchemaMarkupContext.Provider value={schema}>
          {renderChildren()}
        </SchemaMarkupContext.Provider>
      )
    } else if (parent.type === 'array') {
      const schema = parent.setItems(props)
      return (
        <SchemaMarkupContext.Provider
          value={Array.isArray(schema) ? schema[0] : schema}
        >
          {renderChildren()}
        </SchemaMarkupContext.Provider>
      )
    } else {
      return renderChildren()
    }
  }


  MarkupField.displayName = 'MarkupField'

  function StringField<
    Decorator extends ReactComponentPath<Components>,
    Component extends ReactComponentPath<Components>
  >(props: ISchemaTypeFieldProps<Components, Component, Decorator>) {
    return <MarkupField {...props} type="string" />
  }

  StringField.displayName = 'StringField'

  function ObjectField<
    Decorator extends ReactComponentPath<Components>,
    Component extends ReactComponentPath<Components>
  >(props: ISchemaTypeFieldProps<Components, Component, Decorator>) {
    return <MarkupField {...props} type="object" />
  }

  ObjectField.displayName = 'ObjectField'

  function ArrayField<
    Decorator extends ReactComponentPath<Components>,
    Component extends ReactComponentPath<Components>
  >(props: ISchemaTypeFieldProps<Components, Component, Decorator>) {
    return <MarkupField {...props} type="array" />
  }

  ArrayField.displayName = 'ArrayField'

  function BooleanField<
    Decorator extends ReactComponentPath<Components>,
    Component extends ReactComponentPath<Components>
  >(props: ISchemaTypeFieldProps<Components, Component, Decorator>) {
    return <MarkupField {...props} type="boolean" />
  }

  BooleanField.displayName = 'BooleanField'

  function NumberField<
    Decorator extends ReactComponentPath<Components>,
    Component extends ReactComponentPath<Components>
  >(props: ISchemaTypeFieldProps<Components, Component, Decorator>) {
    return <MarkupField {...props} type="number" />
  }

  NumberField.displayName = 'NumberField'

  function DateField<
    Decorator extends ReactComponentPath<Components>,
    Component extends ReactComponentPath<Components>
  >(props: ISchemaTypeFieldProps<Components, Component, Decorator>) {
    return <MarkupField {...props} type="date" />
  }

  DateField.displayName = 'DateField'

  function DateTimeField<
    Decorator extends ReactComponentPath<Components>,
    Component extends ReactComponentPath<Components>
  >(props: ISchemaTypeFieldProps<Components, Component, Decorator>) {
    return <MarkupField {...props} type="datetime" />
  }

  DateTimeField.displayName = 'DateTimeField'

  function VoidField<
    Decorator extends ReactComponentPath<Components>,
    Component extends ReactComponentPath<Components>
  >(props: ISchemaTypeFieldProps<Components, Component, Decorator>) {
    return <MarkupField {...props} type="void" />
  }

  VoidField.displayName = 'VoidField'

  SchemaField.Markup = MarkupField
  SchemaField.String = StringField
  SchemaField.Object = ObjectField
  SchemaField.Array = ArrayField
  SchemaField.Boolean = BooleanField
  SchemaField.Date = DateField
  SchemaField.DateTime = DateTimeField
  SchemaField.Void = VoidField
  SchemaField.Number = NumberField

  return SchemaField
}