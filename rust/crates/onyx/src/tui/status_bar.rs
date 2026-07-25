use tui::{
    backend::Backend,
    layout::Rect,
    style::{Color, Style},
    text::Span,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

pub fn draw_status_bar<B: Backend>(f: &mut Frame<B>, area: Rect, heartbeat_ok: bool) {
    let status_color = if heartbeat_ok {
        Color::Green
    } else {
        Color::Yellow
    };

    let text = vec![
        tui::text::Spans::from(vec![
            Span::styled("[Session: Active]", Style::default().fg(status_color)),
        ])
    ];

    let paragraph = Paragraph::new(text).block(Block::default().borders(Borders::ALL));
    f.render_widget(paragraph, area);
}
