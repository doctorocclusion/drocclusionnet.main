extern crate serde;
extern crate serde_yaml;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate failure;
extern crate handlebars;

use std::path::PathBuf;
use std::env::args;
use std::fs::File;

use failure::{err_msg, Error};
use handlebars::Handlebars;

fn main() -> Result<(), Error> {
    let mut args = args();
    args.next();
    let config_path = PathBuf::from(args.next().ok_or(err_msg("no config given"))?).canonicalize()?;
    if !config_path.is_file() { bail!("config must be a file") }
    let root_path = config_path.parent().ok_or(err_msg("config parent is not a dir"))?;

    let mut config: Config = serde_yaml::from_reader(File::open(&config_path)?)?;
    for p in &mut [&mut config.source, &mut config.target] {
        // TODO: WTF
        if !p.is_absolute() {
            let abs = root_path.join(&p);
            **p = abs;
        }
    }
    let config = config;
    println!("{:?}", config);

    let hb = Handlebars::new();

    for apply in &config.apply {
        let mut s = File::open(config.source.join(apply))?;
        let mut t = File::create(config.target.join(apply))?;
        hb.render_template_source_to_write(&mut s, &(), &mut t)?;
    }

    Ok(())
}

#[derive(Debug, Deserialize)]
pub struct Config {
    pub apply: Vec<PathBuf>,
    pub source: PathBuf,
    pub target: PathBuf,
}
