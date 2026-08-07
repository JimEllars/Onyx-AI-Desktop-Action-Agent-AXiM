use tui::{
    backend::Backend,
    layout::Rect,
    style::{Color, Style},
    text::Span,
    widgets::{Block, Borders, Paragraph},
    Frame,
};

pub fn draw_status_bar<B: Backend>(f: &mut Frame<B>, area: Rect, heartbeat_ok: bool, queue_depth: usize, edge_health: bool) {
    let status_color = if heartbeat_ok {
        Color::Green
    } else {
        Color::Yellow
    };

    let queue_color = if queue_depth <= 20 {
        Color::Green
    } else if queue_depth <= 70 {
        Color::Yellow
    } else {
        Color::Red
    };

    let edge_text = if edge_health {
        "[Edge: OK]"
    } else {
        "[Edge: OFF]"
    };

    let edge_color = if edge_health {
        Color::Green
    } else {
        Color::Red
    };

    let text = vec![
        tui::text::Spans::from(vec![
            Span::styled("[Session: Active] ", Style::default().fg(status_color)),
            Span::styled(format!("[Queue: {}] ", queue_depth), Style::default().fg(queue_color)),
            Span::styled(edge_text, Style::default().fg(edge_color)),
        ])
    ];

    let paragraph = Paragraph::new(text).block(Block::default().borders(Borders::ALL));
    f.render_widget(paragraph, area);
}
