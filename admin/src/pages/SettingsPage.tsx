import { useState } from 'react'
import { Badge, Card, Toggle } from '@/components/ui'
import { WIDGET_TEMPLATES } from '@/data/mock'
import type { WidgetTemplate } from '@/types'

type CustomTheme = {
  primary: string
  accent: string
  surface: string
  text: string
}

export function SettingsPage() {
  const [apiKey, setApiKey] = useState('sk-************************D4kA')
  const [showKey, setShowKey] = useState(false)
  const [model, setModel] = useState('gpt-4o-mini')
  const [voiceModel, setVoiceModel] = useState('gpt-realtime')
  const [voiceName, setVoiceName] = useState('marin')

  const [chatbotEnabled, setChatbotEnabled] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [leadCapture, setLeadCapture] = useState(true)
  const [showBranding, setShowBranding] = useState(true)

  const [templateId, setTemplateId] = useState('classic-gold')
  const [custom, setCustom] = useState<CustomTheme>({
    primary: '#0a0a0a',
    accent: '#d4af37',
    surface: '#faf8f3',
    text: '#1a1a1a',
  })
  const [radius, setRadius] = useState(22)
  const [position, setPosition] = useState<'right' | 'left'>('right')
  const [welcomeTitle, setWelcomeTitle] = useState('Professional Kitchen & Laundry')
  const [saved, setSaved] = useState(false)

  const activeTemplate = WIDGET_TEMPLATES.find((t) => t.id === templateId)
  const theme: CustomTheme = templateId === 'custom' ? custom : (activeTemplate ?? custom)

  const applyTemplate = (template: WidgetTemplate) => {
    setTemplateId(template.id)
    setCustom({
      primary: template.primary,
      accent: template.accent,
      surface: template.surface,
      text: template.text,
    })
  }

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="page-grid">
      <div className="settings-grid">
        {/* AI configuration */}
        <Card title="AI configuration" subtitle="OpenAI credentials and models">
          <div className="form-stack">
            <label className="form-field">
              <span className="form-field__label">OpenAI API key</span>
              <div className="key-field">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="ui-input key-field__input"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="ui-btn"
                  onClick={() => setShowKey((prev) => !prev)}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <span className="form-hint">Stored securely on the server. Never exposed to visitors.</span>
            </label>

            <label className="form-field">
              <span className="form-field__label">Chat model</span>
              <select
                className="ui-input"
                value={model}
                onChange={(event) => setModel(event.target.value)}
              >
                <option value="gpt-4o-mini">gpt-4o-mini (fast, economical)</option>
                <option value="gpt-4o">gpt-4o (highest quality)</option>
                <option value="gpt-4.1-mini">gpt-4.1-mini</option>
              </select>
            </label>

            <div className="form-row">
              <label className="form-field">
                <span className="form-field__label">Voice model</span>
                <select
                  className="ui-input"
                  value={voiceModel}
                  onChange={(event) => setVoiceModel(event.target.value)}
                >
                  <option value="gpt-realtime">gpt-realtime</option>
                  <option value="gpt-realtime-mini">gpt-realtime-mini</option>
                </select>
              </label>

              <label className="form-field">
                <span className="form-field__label">Voice</span>
                <select
                  className="ui-input"
                  value={voiceName}
                  onChange={(event) => setVoiceName(event.target.value)}
                >
                  <option value="marin">Marin (warm, professional)</option>
                  <option value="cedar">Cedar (deep, calm)</option>
                  <option value="alloy">Alloy (neutral)</option>
                  <option value="coral">Coral (bright)</option>
                </select>
              </label>
            </div>
          </div>
        </Card>

        {/* Assistant switches */}
        <Card title="Assistant controls" subtitle="Enable or disable live features">
          <div className="toggle-stack">
            <Toggle
              checked={chatbotEnabled}
              onChange={setChatbotEnabled}
              label="Chatbot widget"
              description="Show the chat widget to website visitors"
            />
            <Toggle
              checked={voiceEnabled}
              onChange={setVoiceEnabled}
              label="Voice agent"
              description="Allow visitors to start live voice conversations"
            />
            <Toggle
              checked={leadCapture}
              onChange={setLeadCapture}
              label="Lead capture"
              description="Ask for contact details when intent is detected"
            />
            <Toggle
              checked={showBranding}
              onChange={setShowBranding}
              label="Powered by footer"
              description="Show the Culinova footer inside the widget"
            />
          </div>

          <div className="settings-state">
            <Badge tone={chatbotEnabled ? 'green' : 'red'}>
              Chatbot {chatbotEnabled ? 'active' : 'off'}
            </Badge>
            <Badge tone={voiceEnabled ? 'green' : 'red'}>
              Voice {voiceEnabled ? 'active' : 'off'}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Templates */}
      <Card
        title="Widget templates"
        subtitle="One-click looks for the chat widget"
        actions={templateId === 'custom' ? <Badge tone="gold">Custom</Badge> : undefined}
      >
        <div className="template-grid">
          {WIDGET_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`template-card${templateId === template.id ? ' template-card--active' : ''}`}
              onClick={() => applyTemplate(template)}
            >
              <div
                className="template-card__preview"
                style={{ background: template.surface }}
              >
                <div
                  className="template-card__preview-header"
                  style={{ background: template.primary }}
                >
                  <span
                    className="template-card__preview-dot"
                    style={{ background: template.accent }}
                  />
                </div>
                <div className="template-card__preview-body">
                  <span
                    className="template-card__preview-bubble"
                    style={{ background: template.primary }}
                  />
                  <span
                    className="template-card__preview-bubble template-card__preview-bubble--right"
                    style={{ background: template.accent }}
                  />
                </div>
              </div>
              <p className="template-card__name">{template.name}</p>
              <p className="template-card__desc">{template.description}</p>
            </button>
          ))}
        </div>
      </Card>

      <div className="settings-grid">
        {/* Custom theme */}
        <Card title="Custom theme" subtitle="Fine-tune widget colors and shape">
          <div className="form-stack">
            <div className="color-grid">
              {(
                [
                  ['primary', 'Primary'],
                  ['accent', 'Accent'],
                  ['surface', 'Surface'],
                  ['text', 'Text'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="color-field">
                  <span className="form-field__label">{label}</span>
                  <span className="color-field__control">
                    <input
                      type="color"
                      value={custom[key]}
                      onChange={(event) => {
                        setTemplateId('custom')
                        setCustom((prev) => ({ ...prev, [key]: event.target.value }))
                      }}
                      aria-label={`${label} color`}
                    />
                    <code>{custom[key]}</code>
                  </span>
                </label>
              ))}
            </div>

            <label className="form-field">
              <span className="form-field__label">Corner radius: {radius}px</span>
              <input
                type="range"
                min={0}
                max={32}
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
                className="ui-range"
              />
            </label>

            <div className="form-row">
              <label className="form-field">
                <span className="form-field__label">Widget position</span>
                <select
                  className="ui-input"
                  value={position}
                  onChange={(event) => setPosition(event.target.value as 'right' | 'left')}
                >
                  <option value="right">Bottom right</option>
                  <option value="left">Bottom left</option>
                </select>
              </label>

              <label className="form-field">
                <span className="form-field__label">Welcome title</span>
                <input
                  type="text"
                  className="ui-input"
                  value={welcomeTitle}
                  onChange={(event) => setWelcomeTitle(event.target.value)}
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Live preview */}
        <Card title="Live preview" subtitle="How visitors will see the widget">
          <div className="widget-preview-stage">
            <div
              className="widget-preview"
              style={{
                background: theme.surface,
                borderRadius: `${radius}px`,
                marginLeft: position === 'left' ? 0 : 'auto',
                marginRight: position === 'left' ? 'auto' : 0,
              }}
            >
              <div className="widget-preview__header" style={{ background: theme.primary }}>
                <span className="widget-preview__title" style={{ color: theme.surface }}>
                  Culinova
                </span>
                <span
                  className="widget-preview__status"
                  style={{ background: theme.accent, color: theme.primary }}
                >
                  Online
                </span>
              </div>

              <div className="widget-preview__body">
                <p className="widget-preview__welcome" style={{ color: theme.text }}>
                  {welcomeTitle || 'Welcome'}
                </p>
                <div
                  className="widget-preview__bubble widget-preview__bubble--bot"
                  style={{ color: theme.text }}
                >
                  Hello! How may I help you today?
                </div>
                <div
                  className="widget-preview__bubble widget-preview__bubble--user"
                  style={{ background: theme.primary, color: theme.surface }}
                >
                  Tell me about your services
                </div>
              </div>

              <div className="widget-preview__composer">
                <span className="widget-preview__input">Write your message...</span>
                <span className="widget-preview__send" style={{ background: theme.accent }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="settings-save">
        <button type="button" className="ui-btn ui-btn--primary ui-btn--lg" onClick={save}>
          Save all settings
        </button>
        {saved && <Badge tone="green">Saved</Badge>}
      </div>
    </div>
  )
}
